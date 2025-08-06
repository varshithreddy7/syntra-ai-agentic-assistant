import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        convex: !!process.env.CONVEX_DEPLOYMENT,
        wxflows: !!process.env.WXFLOWS_ENDPOINT && !!process.env.WXFLOWS_APIKEY,
        clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
