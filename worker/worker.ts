import 'dotenv/config';
import IORedis from 'ioredis';
import { Worker } from 'bullmq';
import { prisma } from '../lib/prisma';
import { sendEmail, appUrl } from '../lib/email';

const url = process.env.REDIS_URL;
if (!url) {
  console.error('REDIS_URL is required to run the Qevli background worker.');
  process.exit(1);
}

const connection = new IORedis(url, { maxRetriesPerRequest: null, enableReadyCheck: false });

async function processJob(queue:string, job:any){
  if(queue==='qevli-media'){
    const assetId=job.data?.assetId;
    if(assetId) await prisma.mediaAsset.updateMany({where:{id:assetId},data:{status:'READY'}});
    return {ok:true,kind:'media'};
  }
  if(queue==='qevli-notifications'){
    const id=job.data?.notificationId;
    if(process.env.QEVLI_EMAIL_ENABLED==='true' && id){
      const n=await prisma.notification.findUnique({where:{id},include:{recipient:{select:{email:true,name:true}}}});
      if(n) await sendEmail({to:n.recipient.email,subject:`Qevli notification`,html:`<p>Hi ${n.recipient.name},</p><p>${n.message}</p><p><a href="${appUrl()}${n.link||'/notifications'}">Open Qevli</a></p>`});
    }
    return {ok:true,kind:'notification'};
  }
  if(queue==='qevli-moderation') return {ok:true,kind:'moderation-boundary'};
  if(queue==='qevli-recommendations') return {ok:true,kind:'recommendation-boundary'};
  if(queue==='qevli-analytics') return {ok:true,kind:'analytics-boundary'};
  return {ok:true};
}

const queueNames = ['qevli-media', 'qevli-notifications', 'qevli-analytics', 'qevli-moderation', 'qevli-recommendations'];
const workers = queueNames.map(name => new Worker(name, job => processJob(name,job), { connection, concurrency: 10 }));
for (const worker of workers) worker.on('failed', (job, err) => console.error('Qevli job failed', job?.id, err));
console.log(`Qevli V33 workers online: ${queueNames.join(', ')}`);
