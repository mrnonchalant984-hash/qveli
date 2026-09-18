import { NextResponse } from 'next/server';
import { createUploadUrl, publicMediaUrl } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';
const allowed=new Set(['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']);
export async function POST(request:Request){
  const u=await getCurrentUser(); if(!u)return NextResponse.json({error:'Login required'},{status:401});
  const rl=await rateLimit(`presign:${u.id}`,30,60); if(!rl.allowed)return NextResponse.json({error:'Upload limit reached.'},{status:429});
  const body=await request.json().catch(()=>null); const contentType=String(body?.contentType||'');
  if(!allowed.has(contentType))return NextResponse.json({error:'Unsupported file type.'},{status:400});
  const ext=contentType.startsWith('video/')?(contentType==='video/webm'?'.webm':contentType==='video/quicktime'?'.mov':'.mp4'):(contentType==='image/png'?'.png':contentType==='image/webp'?'.webp':contentType==='image/gif'?'.gif':'.jpg');
  const key=`uploads/${u.id}/${crypto.randomUUID()}${ext}`;
  const uploadUrl=await createUploadUrl(key,contentType); if(!uploadUrl)return NextResponse.json({error:'Supabase storage is not configured.'},{status:503});
  return NextResponse.json({uploadUrl,publicUrl:publicMediaUrl(key),key,expiresIn:900});
}
