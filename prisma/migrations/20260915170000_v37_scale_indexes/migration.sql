-- Qevli V37 scale indexes. Safe additive indexes only.
CREATE INDEX IF NOT EXISTS "Post_visibility_createdAt_idx" ON "Post"("visibility", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_authorId_createdAt_idx" ON "Post"("authorId", "createdAt");
CREATE INDEX IF NOT EXISTS "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "Story_authorId_expiresAt_idx" ON "Story"("authorId", "expiresAt");
CREATE INDEX IF NOT EXISTS "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notification_recipientId_readAt_createdAt_idx" ON "Notification"("recipientId", "readAt", "createdAt");
CREATE INDEX IF NOT EXISTS "MediaAsset_status_createdAt_idx" ON "MediaAsset"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "RecommendationFeedback_userId_targetType_createdAt_idx" ON "RecommendationFeedback"("userId", "targetType", "createdAt");
