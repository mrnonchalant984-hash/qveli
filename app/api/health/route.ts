import { prisma } from '@/lib/prisma';
import { ok, serverError } from '@/lib/http';
export async function GET(){ try { await prisma.$queryRaw`SELECT 1`; return ok({ok:true, service:'qevli-api', database:'connected'}); } catch { return serverError(); } }
