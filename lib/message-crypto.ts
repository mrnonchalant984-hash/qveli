import crypto from 'crypto';
const prefix='qevli:v1:';
function key(){const raw=process.env.MESSAGE_ENCRYPTION_KEY||'qevli-local-message-key-change-this-32';return crypto.createHash('sha256').update(raw).digest();}
export function encryptMessage(text:string){const iv=crypto.randomBytes(12);const c=crypto.createCipheriv('aes-256-gcm',key(),iv);const out=Buffer.concat([c.update(text,'utf8'),c.final()]);const tag=c.getAuthTag();return prefix+Buffer.concat([iv,tag,out]).toString('base64url');}
export function decryptMessage(text:string){if(!text.startsWith(prefix))return text;try{const b=Buffer.from(text.slice(prefix.length),'base64url');const iv=b.subarray(0,12),tag=b.subarray(12,28),data=b.subarray(28);const d=crypto.createDecipheriv('aes-256-gcm',key(),iv);d.setAuthTag(tag);return Buffer.concat([d.update(data),d.final()]).toString('utf8');}catch{return '[Encrypted message unavailable]';}}
