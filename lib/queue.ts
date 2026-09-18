import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import { prisma } from './prisma';

export type QevliQueueName='qevli-media'|'qevli-notifications'|'qevli-analytics'|'qevli-moderation'|'qevli-recommendations';
export const QEVLI_QUEUES={media:'qevli-media',notifications:'qevli-notifications',analytics:'qevli-analytics',moderation:'qevli-moderation',recommendations:'qevli-recommendations'} as const;
let connection:IORedis|null=null; const queues=new Map<string,Queue>();
function getConnection(){const url=process.env.REDIS_URL;if(!url)return null;if(!connection)connection=new IORedis(url,{maxRetriesPerRequest:null,enableReadyCheck:false});return connection;}
export async function enqueueQevliJob(name:QevliQueueName,jobName:string,data:Record<string,unknown>){
 const redis=getConnection(); if(!redis)return null;
 const background=await prisma.backgroundJob.create({data:{queue:name,jobName,payload:data as any}});
 try{let queue=queues.get(name);if(!queue){queue=new Queue(name,{connection:redis});queues.set(name,queue);}const job=await queue.add(jobName,{...data,backgroundJobId:background.id},{removeOnComplete:1000,removeOnFail:5000,attempts:3,backoff:{type:'exponential',delay:1000}});return job;}catch(e){await prisma.backgroundJob.update({where:{id:background.id},data:{status:'FAILED',finishedAt:new Date(),error:String(e).slice(0,1000)}}).catch(()=>{});throw e;}
}
export async function enqueue(name:QevliQueueName,jobName:string,data:Record<string,unknown>){const job=await enqueueQevliJob(name,jobName,data);return {queued:Boolean(job),jobId:job?.id??null};}
