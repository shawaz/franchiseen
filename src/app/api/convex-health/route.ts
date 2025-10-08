import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real implementation, you would check the Convex client status
    // For now, we'll return a simple health check
    
    // You could integrate with your Convex client here to check actual connectivity
    // const convexStatus = await checkConvexConnection();
    
    return NextResponse.json(
      { 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'convex-denet',
        // convexStatus: convexStatus
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Convex service unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
