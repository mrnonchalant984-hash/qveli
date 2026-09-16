import { getCurrentUser } from '@/lib/auth'; import { ok, unauthorized } from '@/lib/http'; import { flags } from '@/lib/platform';
export async function GET(){const u=await getCurrentUser();if(!u)return unauthorized();return ok({storage:flags.cloudStorage?'external-or-cloud':'local-development',maxUploadMb:50,cdnConfigured:Boolean(process.env.CDN_BASE_URL)});}
