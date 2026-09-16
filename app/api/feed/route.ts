import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, serverError } from '@/lib/http';

type FeedUser={id:string;username:string;name:string;avatarUrl:string|null;verified:boolean};
const postInclude={author:{select:{id:true,username:true,name:true,avatarUrl:true,verified:true}},_count:{select:{reactions:true,comments:true,shares:true,reposts:true}}} as const;
function decode(v:string|null){if(!v)return {post:null,official:null,qviews:null,repost:null};try{return JSON.parse(Buffer.from(v,'base64url').toString('utf8'))}catch{return {post:null,official:null,qviews:null,repost:null}}}
function encode(v:any){return Buffer.from(JSON.stringify(v)).toString('base64url')}
export async function GET(req:NextRequest){
 try{const me=await getCurrentUser();const u=new URL(req.url);const limit=Math.min(Math.max(Number(u.searchParams.get('limit')||12),1),30);const cursor=decode(u.searchParams.get('cursor'));const newerThan=u.searchParams.get('newerThan');
  const blockedIds=me?[...(await prisma.block.findMany({where:{blockerId:me.id},select:{blockedId:true}})).map(x=>x.blockedId),...(await prisma.block.findMany({where:{blockedId:me.id},select:{blockerId:true}})).map(x=>x.blockerId)]:[];
  const [following,friendRows]=me?await Promise.all([prisma.follow.findMany({where:{followerId:me.id},select:{followingId:true}}),prisma.friendship.findMany({where:{status:'ACCEPTED',OR:[{requesterId:me.id},{addresseeId:me.id}]},select:{requesterId:true,addresseeId:true}})]):[[],[]];
  const followingIds=(following as any[]).map(x=>x.followingId);const friendIds=(friendRows as any[]).map(x=>x.requesterId===me?.id?x.addresseeId:x.requesterId);
  const postWhere:any={visibility:'PUBLIC',...(blockedIds.length?{authorId:{notIn:blockedIds}}:{}),...(newerThan?{createdAt:{gt:new Date(newerThan)}}:{}),...(!newerThan&&cursor.post?{createdAt:{lt:new Date(cursor.post)}}:{})};
  const repostWhere:any={...(newerThan?{createdAt:{gt:new Date(newerThan)}}:{}),...(!newerThan&&cursor.repost?{createdAt:{lt:new Date(cursor.repost)}}:{})};
  const [posts,reposts,official,qviews]=await Promise.all([
    prisma.post.findMany({where:postWhere,include:postInclude,orderBy:{createdAt:'desc'},take:Math.min(limit*3,60)}),
    prisma.repost.findMany({where:repostWhere,include:{author:{select:{id:true,username:true,name:true,avatarUrl:true,verified:true}},post:{include:postInclude}},orderBy:{createdAt:'desc'},take:Math.min(limit*2,40)}),
    prisma.officialFeedItem.findMany({where:newerThan?{publishedAt:{gt:new Date(newerThan)}}:cursor.official?{publishedAt:{lt:new Date(cursor.official)}}:{},include:{_count:{select:{reactions:true,comments:true,shares:true}},reactions:me?{where:{userId:me.id},select:{type:true}}:undefined},orderBy:{publishedAt:'desc'},take:20}),
    prisma.companyUpdate.findMany({where:{company:{slug:'qviews'},...(newerThan?{createdAt:{gt:new Date(newerThan)}}:cursor.qviews?{createdAt:{lt:new Date(cursor.qviews)}}:{})},include:{company:{select:{name:true,logoUrl:true,slug:true}}},orderBy:{createdAt:'desc'},take:12})
  ]) as any;
  const activityTargets=[...official.map((x:any)=>({targetType:'OFFICIAL',targetId:x.id})),...qviews.map((x:any)=>({targetType:'QVIEWS',targetId:x.id}))];
  const activityRows=activityTargets.length?await prisma.feedActivity.findMany({where:{OR:activityTargets},select:{targetType:true,targetId:true,action:true,reactionType:true,userId:true}}):[];
  const activityFor=(targetType:string,targetId:string)=>{const rows=activityRows.filter((a:any)=>a.targetType===targetType&&a.targetId===targetId);return {reactions:rows.filter((a:any)=>a.action==='REACTION').length,comments:rows.filter((a:any)=>a.action==='COMMENT').length,shares:rows.filter((a:any)=>a.action==='SHARE').length,reposts:rows.filter((a:any)=>a.action==='REPOST').length,reacted:me?rows.find((a:any)=>a.action==='REACTION'&&a.userId===me.id)?.reactionType||null:null};};
  const now=Date.now();
  const postItems=posts.map((p:any)=>{const age=Math.max(0,(now-p.createdAt.getTime())/3600000);const affinity=me?(p.authorId===me.id?7:(followingIds.includes(p.authorId)?5:(friendIds.includes(p.authorId)?4:1))):1;const engagement=Math.min(9,p._count.reactions*.5+p._count.comments*.9+p._count.shares*1.1+p._count.reposts*1.2);return {...p,kind:'POST',score:affinity+engagement+Math.max(0,7-age*.16)};});
  const repostItems=reposts.map((r:any)=>{const p=r.post;const age=Math.max(0,(now-r.createdAt.getTime())/3600000);const affinity=me?(r.authorId===me.id?7:(followingIds.includes(r.authorId)?5:(friendIds.includes(r.authorId)?4:1))):1;return {...p,kind:'REPOST',id:r.id,originalPostId:p.id,repostId:r.id,repostAuthor:r.author,repostText:r.text,repostCreatedAt:r.createdAt,score:affinity+3+Math.max(0,6-age*.16)};});
  const officialItems=official.map((x:any)=>({...x,kind:'OFFICIAL',_count:x._count,liked:Boolean(x.reactions?.length),reactionType:x.reactions?.[0]?.type||null,score:5+Math.min(9,x._count.reactions*.5+x._count.comments*.9+x._count.shares*1.1)+Math.max(0,8-(now-x.publishedAt.getTime())/3600000*.18)}));
  const qviewsItems=qviews.map((x:any)=>({id:x.id,kind:'QVIEWS',sourceName:x.company.name,sourceUrl:x.sourceUrl||`/companies/${x.company.slug}`,logoUrl:x.company.logoUrl,title:x.title,body:x.body,mediaUrl:x.mediaUrl,mediaType:x.mediaType,createdAt:x.createdAt,activity:activityFor('QVIEWS',x.id),score:7+Math.max(0,8-(now-x.createdAt.getTime())/3600000*.2)}));
  const merged=[...postItems,...repostItems,...officialItems,...qviewsItems].sort((a:any,b:any)=>b.score-a.score);
  const page=merged.slice(0,limit);
  const lastPost=posts.at(-1)?.createdAt;const lastRepost=reposts.at(-1)?.createdAt;const lastOfficial=official.at(-1)?.publishedAt;const lastQviews=qviews.at(-1)?.createdAt;
  const hasMore=posts.length>=Math.min(limit*3,60)||reposts.length>=Math.min(limit*2,40)||official.length>=20||qviews.length>=12;
  return ok({posts:page,nextCursor:hasMore?encode({post:lastPost?new Date(lastPost).toISOString():cursor.post, repost:lastRepost?new Date(lastRepost).toISOString():cursor.repost, official:lastOfficial?new Date(lastOfficial).toISOString():cursor.official, qviews:lastQviews?new Date(lastQviews).toISOString():cursor.qviews}):null,hasMore});
 }catch(e){console.error(e);return serverError();}
}
