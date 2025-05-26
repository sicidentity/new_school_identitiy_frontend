// app/api/parents/route.ts
import { NextResponse } from 'next/server';
import { Parent, ApiResponse } from '@/types/models';

// Define our own API response type
type ParentsApiResponse = ApiResponse<Parent[]>;

export async function GET(request: Request): Promise<NextResponse<ParentsApiResponse>> {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    console.log('Fetching parents data from backend API');
    
    // Check if we're looking for a specific parent by ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const backendUrl = id 
      ? `${process.env.BACKEND_API_URL}/parents/${id}`
      : `${process.env.BACKEND_API_URL}/parents`;
    
    console.log('Fetching parents from:', backendUrl);
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
      // Disable Next.js cache to ensure fresh data
      // cache: 'no-store'
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
            error: errorData.message || 'Failed to fetch parents',
            timestamp: new Date().toISOString(),
            status: response.status 
          },
          { status: response.status }
        );
      } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json(
          { 
            success: false,
            error: `Failed to fetch parents: ${response.statusText}`,
            timestamp: new Date().toISOString(),
            status: response.status 
          },
          { status: response.status }
        );
      }
    }
    
    const data = await response.json();
    console.log('Successfully fetched parents:', data);
    
    return NextResponse.json({
      success: true,
      data: data.parents || data.data || data, // Handle different response formats
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in API route:', error);
    
    // Log the error but don't return mock data
    console.log('Error occurred, returning error response');
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
