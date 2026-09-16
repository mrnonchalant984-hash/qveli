import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, created, ok, unauthorized, serverError } from "@/lib/http";
export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;const group=await prisma.group.findUnique({where:{id}});if(!group)return bad("Group not found.",404);if(group.privacy!=="PUBLIC" && group.ownerId!==me.id)return bad("This group is private.",403);const member=await prisma.groupMember.upsert({where:{groupId_userId:{groupId:id,userId:me.id}},update:{},create:{groupId:id,userId:me.id,role:"MEMBER"}});return created({member});}catch{return serverError();}}
