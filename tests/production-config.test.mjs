import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

test('production auth has no predictable secret fallback',()=>{const s=read('lib/auth.ts');assert.ok(s.includes('AUTH_SECRET'));assert.ok(s.includes('at least 32 characters'));assert.equal(s.includes('change-this-secret-before-production'),false);});
test('signup is email-only',()=>{const s=read('app/signup/page.tsx');assert.equal(s.includes('Phone number'),false);assert.equal(s.includes('phoneNumber'),false);assert.ok(s.includes('Email address'));});
test('infrastructure mutation endpoints require admin authentication',()=>{for(const p of ['app/api/infra/cache/route.ts','app/api/infra/queue/route.ts','app/api/events/route.ts']){const s=read(p);assert.ok(s.includes('Admin access required'));}});
test('presign endpoint generates server-owned keys',()=>{const s=read('app/api/media/presign/route.ts');assert.ok(s.includes('crypto.randomUUID'));assert.equal(s.includes('body?.key'),false);});
test('dashboard no longer exposes source links',()=>{const s=read('app/dashboard/page.tsx');assert.equal(/View source/i.test(s),false);});
test('legal pages are no longer prototype copy',()=>{assert.equal(read('app/privacy/page.tsx').toLowerCase().includes('prototype'),false);assert.equal(read('app/terms/page.tsx').toLowerCase().includes('prototype'),false);});
test('monetization defaults to disabled in env template',()=>{assert.ok(read('.env.example').includes('QEVLI_MONETIZATION_ENABLED="false"'));});
test('supabase and neon are the documented production storage/database path',()=>{const s=read('.env.example');assert.ok(s.includes('YOUR-NEON-HOST'));assert.ok(s.includes('storage.supabase.co/storage/v1/s3'));assert.ok(s.includes('SUPABASE_SERVICE_ROLE_KEY'));});
