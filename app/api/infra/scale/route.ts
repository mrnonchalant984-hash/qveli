import { NextResponse } from 'next/server';
import { scaleConfig } from '@/lib/scale';

export async function GET() {
  return NextResponse.json({
    version: '31.0.0',
    architecture: 'distributed-platform-foundation',
    region: scaleConfig.region,
    primaryRegion: scaleConfig.primaryRegion,
    readRegions: scaleConfig.readRegions,
    services: {
      redisRest: scaleConfig.redisRest,
      redisProtocol: scaleConfig.redisProtocol,
      objectStorage: scaleConfig.objectStorage,
      cdn: scaleConfig.cdn,
    },
    monetization: false,
  });
}
