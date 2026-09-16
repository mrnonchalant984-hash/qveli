import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  let closed = false;
  let lastNotification = "";
  let lastMessage = "";
  let lastPost = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      send("ready", { connectedAt: new Date().toISOString() });

      const tick = async () => {
        if (closed) return;
        try {
          const [notification, message, post] = await Promise.all([
            prisma.notification.findFirst({ where: { recipientId: user.id }, orderBy: { createdAt: "desc" }, select: { id: true, message: true, link: true, createdAt: true, readAt: true } }),
            prisma.message.findFirst({ where: { conversation: { members: { some: { userId: user.id } } }, senderId: { not: user.id } }, orderBy: { createdAt: "desc" }, select: { id: true, conversationId: true, text: true, createdAt: true, readAt: true } }),
            prisma.post.findFirst({ where: { visibility: "PUBLIC" }, orderBy: { createdAt: "desc" }, select: { id: true, createdAt: true, authorId: true } }),
          ]);
          if (notification?.id && notification.id !== lastNotification) {
            if (lastNotification) send("notification", notification);
            lastNotification = notification.id;
          }
          if (message?.id && message.id !== lastMessage) {
            if (lastMessage) send("message", message);
            lastMessage = message.id;
          }
          if (post?.id && post.id !== lastPost) {
            if (lastPost && post.authorId !== user.id) send("post", post);
            lastPost = post.id;
          }
          send("heartbeat", { at: new Date().toISOString() });
        } catch {
          send("error", { message: "Realtime check temporarily unavailable." });
        }
      };

      await tick();
      const timer = setInterval(tick, 2500);
      const heartbeat = setInterval(() => send("keepalive", { at: new Date().toISOString() }), 15000);

      const close = () => {
        closed = true;
        clearInterval(timer);
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      };
      // Next.js/Node does not expose a portable request abort hook inside this stream,
      // so the stream is bounded by the platform connection lifecycle.
      setTimeout(close, 25 * 60 * 1000);
    },
    cancel() { closed = true; },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
