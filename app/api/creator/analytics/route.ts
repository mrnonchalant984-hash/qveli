import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, unauthorized, serverError } from '@/lib/http';

export async function GET(req:NextRequest){
 try{
  const me=await getCurrentUser(); if(!me)return unauthorized();
  const days=Math.min(90,Math.max(7,Number(new URL(req.url).searchParams.get('days')||30)));
  const since=new Date(Date.now()-days*86400000);
  const [posts,followers,following]=await Promise.all([
   prisma.post.findMany({where:{authorId:me.id,createdAt:{gte:since}},orderBy:{createdAt:'asc'},select:{id:true,createdAt:true,text:true,_count:{select:{reactions:true,comments:true}}}}),
   prisma.follow.findMany({where:{followingId:me.id,createdAt:{gte:since}},orderBy:{createdAt:'asc'},select:{createdAt:true}}),
   prisma.follow.count({where:{followingId:me.id}})
  ]);
  const totalReactions=posts.reduce((n,p)=>n+p._count.reactions,0), totalComments=posts.reduce((n,p)=>n+p._count.comments,0);
  const topPosts=[...posts].sort((a,b)=>(b._count.reactions+b._count.comments)-(a._count.reactions+a._count.comments)).slice(0,5).map(p=>({id:p.id,text:p.text?.slice(0,140)||'Media post',createdAt:p.createdAt,reactions:p._count.reactions,comments:p._count.comments}));
  const byDay=new Map<string,{posts:number,followers:number}>();
  for(let i=days-1;i>=0;i--){const d=new Date(Date.now()-i*86400000);const key=d.toISOString().slice(0,10);byDay.set(key,{posts:0,followers:0});}
  for(const p of posts){const key=p.createdAt.toISOString().slice(0,10);if(byDay.has(key))byDay.get(key)!.posts++;}
  for(const f of followers){const key=f.createdAt.toISOString().slice(0,10);if(byDay.has(key))byDay.get(key)!.followers++;}
  return ok({days,totalFollowers:following,posts:posts.length,totalReactions,totalComments,topPosts,series:[...byDay.entries()].map(([date,v])=>({date,...v}))});
 }catch(e){console.error(e);return serverError();}
}
