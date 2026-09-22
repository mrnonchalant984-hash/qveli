import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, serverError } from "@/lib/http";

export async function GET(req: NextRequest, { params }: { params: Promise<{ tag: string }> }) {
	try {
		const { tag } = await params;
		const clean = tag.replace(/^#/, '').toLowerCase();
		const hashtag = await prisma.hashtag.findUnique({
			where: { tag: clean },
			include: {
				posts: {
					include: {
						post: {
							include: {
								author: { select: { id: true, name: true, username: true, avatarUrl: true, verified: true } },
								_count: { select: { reactions: true, comments: true, shares: true } },
							},
						},
					},
					orderBy: { post: { createdAt: 'desc' } },
				},
			},
		});

		return ok({ tag: clean, posts: hashtag?.posts.map((entry) => entry.post) || [] });
	} catch {
		return serverError();
	}
}
