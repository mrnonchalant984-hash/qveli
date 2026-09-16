import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, bad, unauthorized, serverError } from "@/lib/http";
export async function POST(_:NextRequest,{params}:{params:Promise<{id:string}>}){try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;if(id===me.id)return bad("Invalid target");const b=await prisma.block.findUnique({where:{blockerId_blockedId:{blockerId:me.id,blockedId:id}}});if(b)await prisma.block.delete({where:{id:b.id}});else await prisma.block.create({data:{blockerId:me.id,blockedId:id}});return ok({blocked:!b});}catch{return serverError();}}
