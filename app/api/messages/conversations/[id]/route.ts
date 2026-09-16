import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, ok, serverError, unauthorized } from "@/lib/http";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();

    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: me.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return notFound("Conversation not found.");
    }

    return ok({ conversation });
  } catch {
    return serverError();
  }
}
