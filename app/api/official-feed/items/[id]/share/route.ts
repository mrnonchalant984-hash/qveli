import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, ok, serverError, unauthorized } from '@/lib/http';
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
  try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;const item=await prisma.officialFeedItem.findUnique({where:{id},select:{id:true}});if(!item)return notFound('Official update not found.');const share=await prisma.officialFeedShare.upsert({where:{itemId_userId:{itemId:id,userId:me.id}},create:{itemId:id,userId:me.id},update:{}});return ok({share,shared:true});}catch(e){console.error(e);return serverError();}
}
