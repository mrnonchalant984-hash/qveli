import { NextRequest } from 'next/server'; import { getCurrentUser } from '@/lib/auth'; import { bad, ok, unauthorized } from '@/lib/http';
export async function GET(){const u=await getCurrentUser();if(!u)return unauthorized();return ok({enabled:false,message:'Advertising is part of the platform codebase but is disabled during the current launch phase.'});}
export async function POST(_req:NextRequest){const u=await getCurrentUser();if(!u)return unauthorized();return bad('Advertising is currently disabled.',403);}
