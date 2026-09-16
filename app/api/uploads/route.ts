import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { uploadToSupabase, hasSupabaseStorage } from "@/lib/storage";

export const runtime = "nodejs";
const MAX_BYTES = 50 * 1024 * 1024;
const allowed = new Set(["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","video/quicktime"]);

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const rl = await rateLimit(`upload:${me.id}`, 30, 60);
  if (!rl.allowed) return NextResponse.json({ error: "Upload limit reached. Please try again shortly." }, { status: 429 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file." }, { status: 400 });
    if (!allowed.has(file.type)) return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "File is too large. Maximum is 50MB." }, { status: 400 });
    const ext = path.extname(file.name).toLowerCase() || (file.type.startsWith("video/") ? ".mp4" : ".jpg");
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const key = `uploads/${filename}`;
    if (hasSupabaseStorage()) {
      const url = await uploadToSupabase(key, Buffer.from(await file.arrayBuffer()), file.type);
      return NextResponse.json({ url, mediaType: file.type.startsWith("video/") ? "VIDEO" : "IMAGE", size: file.size, name: file.name });
    }
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${filename}`, mediaType: file.type.startsWith("video/") ? "VIDEO" : "IMAGE", size: file.size, name: file.name });
  } catch { return NextResponse.json({ error: "Upload failed." }, { status: 500 }); }
}
