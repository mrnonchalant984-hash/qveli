import { NextResponse } from 'next/server';
import { enqueue, QEVLI_QUEUES } from '@/lib/queue';
import { getCurrentUser } from '@/lib/auth';
export async function POST(request: Request) {
  const u = await getCurrentUser();
  if (!u || u.role !== 'ADMIN') return NextResponse.json({error:'Admin access required.'},{status:403});
  const body = await request.json().catch(()=>null);
  const queue=String(body?.queue||QEVLI_QUEUES.analytics), jobName=String(body?.jobName||'generic');
  if(!Object.values(QEVLI_QUEUES).includes(queue as any)) return NextResponse.json({error:'Unknown queue'},{status:400});
  const result=await enqueue(queue as any,jobName,body?.data??{});
  return NextResponse.json(result,{status:result.queued?202:503});
}
