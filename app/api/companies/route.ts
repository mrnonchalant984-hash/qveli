import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, serverError } from "@/lib/http";
const qviews={slug:"qviews",name:"Qviews",category:"Official Qevli company",description:"Qviews is an official Qevli company page for product updates, announcements, launches and community news."};
export async function GET(){try{const me=await getCurrentUser();if(!me)return unauthorized();let company=await prisma.company.findUnique({where:{slug:qviews.slug}});if(!company)company=await prisma.company.create({data:qviews});const following=!!await prisma.companyFollow.findUnique({where:{companyId_userId:{companyId:company.id,userId:me.id}}});const followers=await prisma.companyFollow.count({where:{companyId:company.id}});return ok({companies:[{...company,following,followers}]});}catch{return serverError();}}
