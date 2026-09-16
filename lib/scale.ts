export const scaleConfig = {
  region: process.env.QEVLI_REGION || 'local',
  primaryRegion: process.env.QEVLI_PRIMARY_REGION || 'local',
  readRegions: (process.env.QEVLI_READ_REGIONS || '').split(',').map(v => v.trim()).filter(Boolean),
  redisRest: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  redisProtocol: Boolean(process.env.REDIS_URL),
  objectStorage: Boolean((process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_STORAGE_BUCKET) || (process.env.S3_ENDPOINT && process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)),
  cdn: Boolean(process.env.CDN_BASE_URL),
};
