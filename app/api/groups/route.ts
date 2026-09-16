import { NextRequest } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, created, ok, unauthorized, serverError } from "@/lib/http";

export async function GET() {
  try {
    const me = await getCurrentUser(); if (!me) return unauthorized();
    const groups = await prisma.group.findMany({
      where: { OR: [{ privacy: "PUBLIC" }, { members: { some: { userId: me.id } } }] }, orderBy: { updatedAt: "desc" },
      include: { owner: { select: { id:true,name:true,username:true,avatarUrl:true,verified:true } }, _count: { select: { members:true, messages:true } } }
    });
    return ok({ groups });
  } catch { return serverError(); }
}

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser(); if (!me) return unauthorized();
    const b = await req.json(); const name = String(b.name || "").trim(); const description = String(b.description || "").trim();
    if (name.length < 2 || name.length > 80) return bad("Group name must be 2-80 characters.");
    const group = await prisma.group.create({ data: { name, description, ownerId: me.id, members: { create: { userId: me.id, role: "OWNER" } } }, include: { owner: { select: { id:true,name:true,username:true,avatarUrl:true,verified:true } }, _count: { select: { members:true, messages:true } } } });
    return created({ group });
  } catch { return serverError(); }
}
