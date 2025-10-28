import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'energy-site-selector',
    timestamp: new Date().toISOString(),
  });
}
