import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notifications';
import { bad, ok, unauthorized, serverError } from '@/lib/http';

export async function POST(req:NextRequest){
 try{
  const me=await getCurrentUser();if(!me)return unauthorized();
  const b=await req.json();const id=String(b.id||'');const action=String(b.action||'').toUpperCase();if(!id)return bad('Missing item.');
  if(action==='SAVE'){
   const sourceType=String(b.sourceType||'').toUpperCase();
   let sourceId=id, title='Saved item', body='', ownerId:string|undefined;
   if(sourceType==='POST'){const p=await prisma.post.findUnique({where:{id},select:{text:true,authorId:true}});if(!p)return bad('Post not found.',404);title=p.text?.slice(0,100)||'Saved post';body=p.text;ownerId=p.authorId;}
   else if(sourceType==='EVENT'){const x=await prisma.event.findUnique({where:{id}});if(!x)return bad('Event not found.',404);title=x.title;body=x.description;ownerId=x.ownerId;}
   else if(sourceType==='MARKETPLACE'){const x=await prisma.marketplaceListing.findUnique({where:{id}});if(!x)return bad('Listing not found.',404);title=x.title;body=x.description;ownerId=x.sellerId;}
   else if(sourceType==='GAME_TEAM'){const x=await prisma.gamingTeam.findUnique({where:{id}});if(!x)return bad('Team not found.',404);title=x.name;body=x.description;ownerId=x.ownerId;}
   else if(sourceType==='TOURNAMENT'){const x=await prisma.tournament.findUnique({where:{id}});if(!x)return bad('Tournament not found.',404);title=x.title;body=x.description;ownerId=x.ownerId;}
   else return bad('Specify a supported source type.');
   const saved=await prisma.savedItem.upsert({where:{userId_sourceType_sourceId:{userId:me.id,sourceType,sourceId}},update:{},create:{userId:me.id,sourceType,sourceId,collection:String(b.collection||'General')}});
   return ok({saved:true,item:saved,title,body,ownerId});
  }
  if(action==='DELETE'){
   const saved=await prisma.savedItem.findUnique({where:{id}});if(saved&&saved.userId===me.id){await prisma.savedItem.delete({where:{id}});return ok({deleted:true});}
   const memory=await prisma.memory.findUnique({where:{id}});if(memory&&memory.userId===me.id){await prisma.memory.delete({where:{id}});return ok({deleted:true});}
   return bad('Not allowed.',403);
  }
  if(action==='RSVP'){
   const event=await prisma.event.findUnique({where:{id}});if(!event)return bad('Event not found.',404);
   const existing=await prisma.eventAttendee.findUnique({where:{eventId_userId:{eventId:id,userId:me.id}}});
   if(existing) await prisma.eventAttendee.delete({where:{id:existing.id}}); else {await prisma.eventAttendee.create({data:{eventId:id,userId:me.id,status:'GOING'}});if(event.ownerId!==me.id)await notify(event.ownerId,'SYSTEM',`${me.name} is going to your event: ${event.title}`,me.id,`/events`);}
   return ok({going:!existing});
  }
  if(action==='JOIN'){
   const team=await prisma.gamingTeam.findUnique({where:{id}});if(!team)return bad('Team not found.',404);
   const existing=await prisma.gamingTeamMember.findUnique({where:{teamId_userId:{teamId:id,userId:me.id}}});if(existing)return ok({joined:true});
   await prisma.gamingTeamMember.create({data:{teamId:id,userId:me.id,role:'MEMBER'}});if(team.ownerId!==me.id)await notify(team.ownerId,'SYSTEM',`${me.name} joined your gaming team: ${team.name}`,me.id,`/gaming`);return ok({joined:true});
  }
  if(action==='REGISTER'){
   const tournament=await prisma.tournament.findUnique({where:{id},include:{registrations:true}});if(!tournament)return bad('Tournament not found.',404);
   const existing=await prisma.tournamentRegistration.findUnique({where:{tournamentId_userId:{tournamentId:id,userId:me.id}}});if(existing)return ok({registered:true});
   if(tournament.maxTeams&&tournament.registrations.length>=tournament.maxTeams)return bad('This tournament is full.');
   await prisma.tournamentRegistration.create({data:{tournamentId:id,userId:me.id,teamName:String(b.teamName||'').trim()||null}});if(tournament.ownerId!==me.id)await notify(tournament.ownerId,'SYSTEM',`${me.name} registered for ${tournament.title}`,me.id,`/tournaments`);return ok({registered:true});
  }
  return bad('Unknown action.');
 }catch(e){console.error(e);return serverError()}
}
