import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, bad, serverError } from "@/lib/http";

function isQevliAdmin(user: any) {
  return user?.role === "ADMIN";
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const company = await prisma.company.findUnique({ where: { slug } });
    if (!company) return ok({ updates: [] });
    const updates = await prisma.companyUpdate.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return ok({ updates });
  } catch {
    return serverError();
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();
    if (!isQevliAdmin(me)) return bad("Admin access required.", 403);
    const { slug } = await params;
    const body = await req.json();
    const title = String(body.title || "").trim();
    const text = String(body.body || "").trim();
    const mediaUrl = body.mediaUrl ? String(body.mediaUrl) : null;
    const mediaType = body.mediaType ? String(body.mediaType) : null;
    if (!title || !text) return bad("Title and update text are required.");
    if (title.length > 140) return bad("Title is too long.");
    if (text.length > 5000) return bad("Update text is too long.");
    const company = await prisma.company.findUnique({ where: { slug } });
    if (!company) return bad("Official page not found.");
    const update = await prisma.companyUpdate.create({
      data: { companyId: company.id, title, body: text, mediaUrl, mediaType },
    });
    const followers = await prisma.companyFollow.findMany({ where: { companyId: company.id }, select: { userId: true } });
    if (followers.length) {
      await prisma.notification.createMany({
        data: followers.map((f) => ({
          recipientId: f.userId,
          type: "SYSTEM" as const,
          message: `Qviews: ${title}`,
          link: "/companies",
        })),
      });
    }
    return ok({ update }, { status: 201 });
  } catch {
    return serverError();
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();
    if (!isQevliAdmin(me)) return bad("Admin access required.", 403);
    const { slug } = await params;
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return bad("Update id is required.");
    const company = await prisma.company.findUnique({ where: { slug } });
    if (!company) return bad("Official page not found.");
    await prisma.companyUpdate.deleteMany({ where: { id, companyId: company.id } });
    return ok({ success: true });
  } catch {
    return serverError();
  }
}
