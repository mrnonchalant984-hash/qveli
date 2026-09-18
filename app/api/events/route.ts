import { NextResponse } from 'next/server';
import { publishEvent } from '@/lib/event-bus';
import { getCurrentUser } from '@/lib/auth';
export async function POST(request: Request) {
  const u=await getCurrentUser();
  if(!u || u.role!=='ADMIN') return NextResponse.json({error:'Admin access required.'},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.type || String(body.type).length>120) return NextResponse.json({error:'Valid event type is required.'},{status:400});
  const result=await publishEvent({type:String(body.type),payload:body.payload??{}});
  return NextResponse.json(result,{status:result.published?202:503});
}
