import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, created, ok, unauthorized, serverError } from '@/lib/http';

const TYPES=new Set(['EVENT','MARKETPLACE','VIDEO','SAVE','MEMORY','GAME_TEAM','TOURNAMENT','PAGE','SECURITY','POLL','SETTINGS']);
const owner={select:{id:true,name:true,username:true,avatarUrl:true,verified:true}} as const;
const clean=(v:any,max=10000)=>String(v??'').trim().slice(0,max);
const dateValue=(v:any)=>{const d=new Date(String(v||''));return Number.isNaN(d.getTime())?null:d};

export async function GET(req:NextRequest){
 try{
  const me=await getCurrentUser(); if(!me)return unauthorized();
  const type=String(new URL(req.url).searchParams.get('type')||'EVENT').toUpperCase();
  if(!TYPES.has(type))return bad('Unknown feature.');
  if(type==='EVENT'){
   const rows=await prisma.event.findMany({where:{status:'ACTIVE'},orderBy:{date:'asc'},take:100,include:{owner,attendees:{select:{userId:true,status:true}}}});
   return ok({items:rows.map(x=>({id:x.id,type,title:x.title,body:x.description,status:x.status,createdAt:x.createdAt.toISOString(),owner:x.owner,metadata:{date:x.date.toISOString(),location:x.location,category:x.category,attendees:x.attendees.map(a=>a.userId),attendeeCount:x.attendees.length}}))});
  }
  if(type==='MARKETPLACE'){
   const rows=await prisma.marketplaceListing.findMany({where:{status:'ACTIVE'},orderBy:{createdAt:'desc'},take:100,include:{seller:owner}});
   return ok({items:rows.map(x=>({id:x.id,type,title:x.title,body:x.description,status:x.status,createdAt:x.createdAt.toISOString(),owner:x.seller,metadata:{price:x.price,location:x.location,category:x.category,condition:x.condition,imageUrl:x.imageUrl}}))});
  }
  if(type==='GAME_TEAM'){
   const rows=await prisma.gamingTeam.findMany({where:{status:'OPEN'},orderBy:{createdAt:'desc'},take:100,include:{owner,members:{select:{userId:true,role:true}}}});
   return ok({items:rows.map(x=>({id:x.id,type,title:x.name,body:x.description,status:x.status,createdAt:x.createdAt.toISOString(),owner:x.owner,metadata:{game:x.game,region:x.region,lookingFor:x.lookingFor,members:x.members.map(m=>m.userId),memberCount:x.members.length}}))});
  }
  if(type==='TOURNAMENT'){
   const rows=await prisma.tournament.findMany({where:{status:'OPEN'},orderBy:{startDate:'asc'},take:100,include:{owner,registrations:{select:{userId:true,teamName:true}}}});
   return ok({items:rows.map(x=>({id:x.id,type,title:x.title,body:x.description,status:x.status,createdAt:x.createdAt.toISOString(),owner:x.owner,metadata:{game:x.game,date:x.startDate.toISOString(),format:x.format,maxTeams:x.maxTeams,registrations:x.registrations.map(r=>r.userId),registrationCount:x.registrations.length}}))});
  }
  if(type==='SAVE'){
   const rows=await prisma.savedItem.findMany({where:{userId:me.id},orderBy:{createdAt:'desc'},take:100});
   const items=await Promise.all(rows.map(async s=>{
    let title=s.sourceId, body='', sourceOwner:any=undefined;
    if(s.sourceType==='POST'){const p=await prisma.post.findUnique({where:{id:s.sourceId},select:{id:true,text:true,author:owner}});if(p){title=p.text?.slice(0,100)||'Saved post';body=p.text;sourceOwner=p.author;}}
    if(s.sourceType==='EVENT'){const x=await prisma.event.findUnique({where:{id:s.sourceId},include:{owner}});if(x){title=x.title;body=x.description;sourceOwner=x.owner;}}
    if(s.sourceType==='MARKETPLACE'){const x=await prisma.marketplaceListing.findUnique({where:{id:s.sourceId},include:{seller:owner}});if(x){title=x.title;body=x.description;sourceOwner=x.seller;}}
    if(s.sourceType==='GAME_TEAM'){const x=await prisma.gamingTeam.findUnique({where:{id:s.sourceId},include:{owner}});if(x){title=x.name;body=x.description;sourceOwner=x.owner;}}
    if(s.sourceType==='TOURNAMENT'){const x=await prisma.tournament.findUnique({where:{id:s.sourceId},include:{owner}});if(x){title=x.title;body=x.description;sourceOwner=x.owner;}}
    return {id:s.id,type:'SAVE',title,body,status:'SAVED',createdAt:s.createdAt.toISOString(),owner:sourceOwner,metadata:{sourceType:s.sourceType,sourceId:s.sourceId,collection:s.collection}};
   }));
   return ok({items});
  }
  if(type==='MEMORY'){
   const [rows,posts]=await Promise.all([
    prisma.memory.findMany({where:{userId:me.id},orderBy:{memoryDate:'desc'},take:100}),
    prisma.post.findMany({where:{authorId:me.id},orderBy:{createdAt:'desc'},take:100,select:{id:true,text:true,imageUrl:true,mediaUrl:true,createdAt:true}})
   ]);
   const currentYear=new Date().getFullYear();
   const auto=posts.filter(p=>p.createdAt.getFullYear()<currentYear).map(p=>({id:`memory-post-${p.id}`,type:'MEMORY_AUTO',owner:{id:me.id,name:me.name,username:me.username,avatarUrl:me.avatarUrl,verified:me.verified},title:p.text?.slice(0,100)||'A Qevli memory',body:p.text||'Media memory',metadata:{memoryDate:p.createdAt.toISOString(),sourcePostId:p.id},status:'AUTO',createdAt:p.createdAt.toISOString()}));
   const manual=rows.map(x=>({id:x.id,type:'MEMORY',owner:{id:me.id,name:me.name,username:me.username,avatarUrl:me.avatarUrl,verified:me.verified},title:x.title,body:x.body,metadata:{memoryDate:x.memoryDate.toISOString(),sourcePostId:x.sourcePostId},status:'ACTIVE',createdAt:x.createdAt.toISOString()}));
   return ok({items:[...manual,...auto].sort((a,b)=>+new Date(b.metadata.memoryDate)-+new Date(a.metadata.memoryDate)).slice(0,100)});
  }
  const rows=await prisma.platformRecord.findMany({where:{type,ownerId:me.id},orderBy:{createdAt:'desc'},take:100,include:{owner}});
  return ok({items:rows});
 }catch(e){console.error(e);return serverError()}
}

export async function POST(req:NextRequest){
 try{
  const me=await getCurrentUser();if(!me)return unauthorized();
  const b=await req.json();const type=String(b.type||'').toUpperCase();if(!TYPES.has(type))return bad('Unknown feature.');
  const title=clean(b.title,180), body=clean(b.body,10000), metadata=(b.metadata&&typeof b.metadata==='object')?b.metadata:{};
  if(type==='EVENT'){
   const date=dateValue(metadata.date);if(!title)return bad('A title is required.');if(!date)return bad('Choose a valid event date.');
   const item=await prisma.event.create({data:{ownerId:me.id,title,description:body,date,location:clean(metadata.location,240)||null,category:clean(metadata.category,80)||null},include:{owner,attendees:true}});
   await prisma.eventAttendee.create({data:{eventId:item.id,userId:me.id,status:'GOING'}});
   return created({item});
  }
  if(type==='MARKETPLACE'){
   const price=Number(String(metadata.price||'').replace(/[^0-9]/g,''));if(!title)return bad('A title is required.');if(!Number.isFinite(price)||price<0)return bad('Add a valid price in NGN.');
   const item=await prisma.marketplaceListing.create({data:{sellerId:me.id,title,description:body,price,location:clean(metadata.location,240)||null,category:clean(metadata.category,80)||null,condition:clean(metadata.condition,80)||null,imageUrl:clean(metadata.imageUrl,2000)||null},include:{seller:owner}});
   return created({item});
  }
  if(type==='GAME_TEAM'){
   if(!title||!clean(metadata.game,100))return bad('Team name and game are required.');
   const item=await prisma.gamingTeam.create({data:{ownerId:me.id,name:title,description:body,game:clean(metadata.game,100),region:clean(metadata.region,100)||null,lookingFor:clean(metadata.lookingFor,240)||null},include:{owner,members:true}});
   await prisma.gamingTeamMember.create({data:{teamId:item.id,userId:me.id,role:'OWNER'}});
   return created({item});
  }
  if(type==='TOURNAMENT'){
   const date=dateValue(metadata.date);const game=clean(metadata.game,100);if(!title||!game)return bad('Tournament name and game are required.');if(!date)return bad('Choose a valid start date.');
   const maxTeams=metadata.maxTeams?Math.max(2,Math.min(1024,Number(metadata.maxTeams))):null;
   const item=await prisma.tournament.create({data:{ownerId:me.id,title,description:body,game,startDate:date,format:clean(metadata.format,100)||null,maxTeams},include:{owner,registrations:true}});
   return created({item});
  }
  if(type==='MEMORY'){
   const date=dateValue(metadata.date)||new Date();if(!title)return bad('A title is required.');
   const item=await prisma.memory.create({data:{userId:me.id,title,body,memoryDate:date,sourcePostId:clean(metadata.sourcePostId,100)||null}});return created({item});
  }
  if(type==='SAVE'){
   const sourceType=clean(metadata.sourceType,40).toUpperCase();const sourceId=clean(metadata.sourceId,100);if(!sourceType||!sourceId)return bad('A source is required.');
   const item=await prisma.savedItem.upsert({where:{userId_sourceType_sourceId:{userId:me.id,sourceType,sourceId}},update:{collection:clean(metadata.collection,80)||'General'},create:{userId:me.id,sourceType,sourceId,collection:clean(metadata.collection,80)||'General'}});return created({item});
  }
  if(!title)return bad('A title is required.');
  const item=await prisma.platformRecord.create({data:{type,ownerId:me.id,title,body,metadata}});return created({item});
 }catch(e){console.error(e);return serverError()}
}

export async function DELETE(req:NextRequest){
 try{const me=await getCurrentUser();if(!me)return unauthorized();const id=new URL(req.url).searchParams.get('id');if(!id)return bad('Missing id.');
  const type=new URL(req.url).searchParams.get('type');
  if(type==='SAVE'){const item=await prisma.savedItem.findUnique({where:{id}});if(!item||item.userId!==me.id)return bad('Not allowed.',403);await prisma.savedItem.delete({where:{id}});return ok({deleted:true});}
  if(type==='MEMORY'){const item=await prisma.memory.findUnique({where:{id}});if(!item||item.userId!==me.id)return bad('Not allowed.',403);await prisma.memory.delete({where:{id}});return ok({deleted:true});}
  const item=await prisma.platformRecord.findUnique({where:{id}});if(!item||item.ownerId!==me.id)return bad('Not allowed.',403);await prisma.platformRecord.delete({where:{id}});return ok({deleted:true});
 }catch(e){console.error(e);return serverError()}
}
