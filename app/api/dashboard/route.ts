import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, unauthorized, serverError } from '@/lib/http';

const personSelect = { id:true, name:true, username:true, avatarUrl:true, verified:true, professionalMode:true } as const;

export async function GET(){
  try {
    const me = await getCurrentUser();
    if(!me) return unauthorized();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [followers, following, posts, unreadMessages, unreadNotifications, incomingRequests, friends, suggestedPeople, recentPosts] = await Promise.all([
      prisma.follow.count({where:{followingId:me.id}}),
      prisma.follow.count({where:{followerId:me.id}}),
      prisma.post.count({where:{authorId:me.id}}),
      prisma.message.count({where:{conversation:{members:{some:{userId:me.id}}},senderId:{not:me.id},readAt:null}}),
      prisma.notification.count({where:{recipientId:me.id,readAt:null}}),
      prisma.friendship.findMany({
        where:{
          addresseeId:me.id,
          status:'PENDING',
          requester:{
            emailVerifiedAt:{not:null},
            phoneVerifiedAt:{not:null},
            blocksMade:{none:{blockedId:me.id}},
            blocksReceived:{none:{blockerId:me.id}}
          }
        },
        orderBy:{createdAt:'desc'},
        take:8,
        include:{requester:{select:personSelect}}
      }),
      prisma.friendship.findMany({
        where:{
          status:'ACCEPTED',
          OR:[{requesterId:me.id},{addresseeId:me.id}]
        },
        orderBy:{updatedAt:'desc'},
        take:30,
        include:{requester:{select:{...personSelect,lastSeenAt:true}},addressee:{select:{...personSelect,lastSeenAt:true}}}
      }),
      prisma.user.findMany({
        where:{
          id:{not:me.id},
          emailVerifiedAt:{not:null},
          phoneVerifiedAt:{not:null},
          blocksMade:{none:{blockedId:me.id}},
          blocksReceived:{none:{blockerId:me.id}},
          friendRequestsSent:{none:{addresseeId:me.id}},
          friendRequestsReceived:{none:{requesterId:me.id}}
        },
        orderBy:[{verified:'desc'},{createdAt:'desc'}],
        take:6,
        select:personSelect
      }),
      prisma.post.findMany({where:{visibility:'PUBLIC',author:{emailVerifiedAt:{not:null},phoneVerifiedAt:{not:null}}},orderBy:{createdAt:'desc'},take:100,select:{text:true}})
    ]);

    const counts = new Map<string, number>();
    for(const post of recentPosts){
      for(const tag of post.text.match(/#[\p{L}\p{N}_]+/gu) || []){
        const key = tag.toLowerCase();
        counts.set(key,(counts.get(key)||0)+1);
      }
    }
    const trending = [...counts.entries()]
      .sort((a,b)=>b[1]-a[1])
      .slice(0,5)
      .map(([tag,count])=>({tag, count}));

    const friendContacts = friends
      .map((f:any)=>f.requesterId===me.id?f.addressee:f.requester)
      .filter((u:any)=>u.id!==me.id);
    const onlineContacts = friendContacts.filter((u:any)=>u.lastSeenAt && u.lastSeenAt >= fiveMinutesAgo);
    const offlineContacts = friendContacts.filter((u:any)=>!u.lastSeenAt || u.lastSeenAt < fiveMinutesAgo);

    return ok({
      stats:{followers,following,posts,unreadMessages,unreadNotifications},
      incomingRequests: incomingRequests.map((r:any)=>({...r.requester,requestId:r.id})),
      onlineContacts,
      offlineContacts,
      suggestedPeople,
      trending
    },{headers:{'Cache-Control':'no-store'}});
  } catch {
    return serverError();
  }
}
