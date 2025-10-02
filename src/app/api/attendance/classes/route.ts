// app/api/attendance/classes/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    const backendUrl = `${process.env.BACKEND_API_URL}/classes`;
    
    console.log('Fetching classes from:', backendUrl);
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      // Disable Next.js cache to ensure fresh data
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Backend response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { 
            success: false,
            error: errorData.message || 'Failed to fetch classes',
            status: response.status 
          },
          { status: response.status }
        );
      } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json(
          { 
            success: false,
            error: `Failed to fetch classes: ${response.statusText}`,
            status: response.status 
          },
          { status: response.status }
        );
      }
    }

    const classes = await response.json();
    console.log('Successfully fetched classes:', classes);
    
    return NextResponse.json({
      success: true,
      data: classes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in API route:', error);
    
    // Log the error but don't return mock data anymore
    console.log('Error occurred, returning error response');
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        // stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}