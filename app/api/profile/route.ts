import { NextRequest } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, ok, unauthorized, serverError } from "@/lib/http";
import { cleanText } from "@/lib/validation";
export async function PATCH(req:NextRequest){try{const u=await getCurrentUser();if(!u)return unauthorized();const b=await req.json();const data:any={};if("name" in b)data.name=cleanText(b.name,80);if("bio" in b)data.bio=cleanText(b.bio,300);if("avatarUrl" in b)data.avatarUrl=cleanText(b.avatarUrl,1000)||null;const updated=await prisma.user.update({where:{id:u.id},data});return ok({user:publicUser(updated)});}catch{return serverError();}}
