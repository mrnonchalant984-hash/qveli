import 'dotenv/config';
import IORedis from 'ioredis';
import { Worker } from 'bullmq';
import { prisma } from '../lib/prisma';
import { sendEmail, appUrl } from '../lib/email';

const url=process.env.REDIS_URL;
if(!url){console.error('REDIS_URL is required to run the Qevli background worker.');process.exit(1);}
const connection=new IORedis(url,{maxRetriesPerRequest:null,enableReadyCheck:false});

async function processJob(queue:string,job:any){
 const d=job.data||{};
 if(queue==='qevli-media'){
   if(d.assetId){const asset=await prisma.mediaAsset.findUnique({where:{id:String(d.assetId)}});if(asset){await prisma.mediaAsset.update({where:{id:asset.id},data:{status:'PROCESSING'}});try{const r=await fetch(asset.url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(`Media URL returned ${r.status}`);await prisma.mediaAsset.update({where:{id:asset.id},data:{status:'READY'}});}catch(e){await prisma.mediaAsset.update({where:{id:asset.id},data:{status:'FAILED'}});throw e;}}}
   if(d.mediaUrl){const r=await fetch(String(d.mediaUrl),{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(`Media URL returned ${r.status}`);}
   return {ok:true,kind:'media'};
 }
 if(queue==='qevli-notifications'){
   const id=d.notificationId;if(process.env.QEVLI_EMAIL_ENABLED==='true'&&id){const n=await prisma.notification.findUnique({where:{id},include:{recipient:{select:{email:true,name:true}}}});if(n)await sendEmail({to:n.recipient.email,subject:'Qevli notification',html:`<p>Hi ${n.recipient.name},</p><p>${n.message}</p><p><a href="${appUrl()}${n.link||'/notifications'}">Open Qevli</a></p>`});}
   return {ok:true,kind:'notification'};
 }
 if(queue==='qevli-analytics'){
   if(d.name){await prisma.analyticsEvent.create({data:{userId:d.userId?String(d.userId):null,name:String(d.name).slice(0,100),path:d.path?String(d.path).slice(0,200):null,metadata:(d.metadata||null) as any}});}
   return {ok:true,kind:'analytics'};
 }
 if(queue==='qevli-moderation'){
   if(d.reporterId&&d.reason){await prisma.moderationCase.create({data:{reporterId:String(d.reporterId),targetId:d.targetId?String(d.targetId):null,postId:d.postId?String(d.postId):null,reason:String(d.reason).slice(0,120),details:String(d.details||'').slice(0,5000),severity:String(d.severity||'MEDIUM').slice(0,30)}});}
   return {ok:true,kind:'moderation'};
 }
 if(queue==='qevli-recommendations'){
   const userId=d.userId?String(d.userId):null;if(userId){const following=await prisma.follow.findMany({where:{followerId:userId},select:{followingId:true}});const ids=new Set(following.map(x=>x.followingId));ids.add(userId);const suggestions=await prisma.user.findMany({where:{id:{notIn:[...ids]},emailVerifiedAt:{not:null}},orderBy:[{verified:'desc'},{createdAt:'desc'}],take:20,select:{id:true,name:true,username:true,avatarUrl:true,verified:true,professionalMode:true}});await connection.set(`qevli:recommendations:${userId}`,JSON.stringify(suggestions),'EX',900);}
   return {ok:true,kind:'recommendations'};
 }
 return {ok:true,kind:'generic'};
}

const queueNames=['qevli-media','qevli-notifications','qevli-analytics','qevli-moderation','qevli-recommendations'];
const workers=queueNames.map(name=>new Worker(name,async job=>{const bg=job.data?.backgroundJobId?String(job.data.backgroundJobId):null;if(bg)await prisma.backgroundJob.update({where:{id:bg},data:{status:'RUNNING',startedAt:new Date(),attempts:{increment:1}}}).catch(()=>{});try{const result=await processJob(name,job);if(bg)await prisma.backgroundJob.update({where:{id:bg},data:{status:'COMPLETED',finishedAt:new Date(),error:null}}).catch(()=>{});return result;}catch(e){if(bg)await prisma.backgroundJob.update({where:{id:bg},data:{status:'FAILED',error:String(e).slice(0,1000),finishedAt:new Date()}}).catch(()=>{});throw e;}},{connection,concurrency:10}));
for(const worker of workers)worker.on('failed',(job,err)=>console.error('Qevli job failed',job?.id,err));
console.log(`Qevli workers online: ${queueNames.join(', ')}`);
