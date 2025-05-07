// app/api/attendance/classes/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = `${process.env.BACKEND_API_URL}/classes`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch classes' },
        { status: response.status }
      );
    }

    const classes = await response.json();
    
    return NextResponse.json({
      success: true,
      data: classes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}