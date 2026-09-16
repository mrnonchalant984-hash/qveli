import { prisma } from "@/lib/prisma";
import { enqueueQevliJob } from "@/lib/queue";
import type { NotificationType } from "../src/generated/prisma";
export async function notify(recipientId: string, type: NotificationType, message: string, actorId?: string, link?: string) {
  if (recipientId === actorId) return;
  const notification=await prisma.notification.create({ data: { recipientId, actorId, type, message, link } });
  void enqueueQevliJob('qevli-notifications','deliver-notification',{notificationId:notification.id,recipientId,actorId:actorId||null,type,message,link:link||null});
}
