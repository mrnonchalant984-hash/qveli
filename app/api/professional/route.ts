import { NextRequest } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, ok, unauthorized, serverError } from "@/lib/http";

function weekStart() { const d = new Date(); const day = d.getDay(); const diff = (day + 6) % 7; d.setHours(0,0,0,0); d.setDate(d.getDate() - diff); return d; }
export async function GET() {
  try {
    const me = await getCurrentUser(); if (!me) return unauthorized();
    const start = weekStart();
    const [followers, posts, todayPosts] = await Promise.all([
      prisma.follow.count({ where: { followingId: me.id, createdAt: { gte: start } } }),
      prisma.post.count({ where: { authorId: me.id, createdAt: { gte: start } } }),
      prisma.post.count({ where: { authorId: me.id, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } })
    ]);
    return ok({ professionalMode: me.professionalMode, verified: me.verified, dailyTasks: [
      { id:"daily-post", title:"Publish 1 post today", progress: Math.min(todayPosts,1), goal:1 },
      { id:"daily-follower", title:"Gain 1 follower today", progress: Math.min(await prisma.follow.count({where:{followingId:me.id,createdAt:{gte:new Date(new Date().setHours(0,0,0,0))}}}),1), goal:1 }
    ], weekly: [
      { id:"weekly-followers", title:"Gain 10 followers", progress: Math.min(followers,10), goal:10 },
      { id:"weekly-posts", title:"Publish 20 posts", progress: Math.min(posts,20), goal:20 }
    ]});
  } catch { return serverError(); }
}
export async function PATCH(req: NextRequest) {
  try { const me = await getCurrentUser(); if (!me) return unauthorized(); const b = await req.json().catch(()=>({})); if (typeof b.professionalMode !== "boolean") return bad("professionalMode must be true or false."); const user = await prisma.user.update({where:{id:me.id},data:{professionalMode:b.professionalMode}}); return ok({user:publicUser(user),professionalMode:user.professionalMode}); } catch { return serverError(); }
}
