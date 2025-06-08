// app/api/attendance/class/[classId]/route.ts
import { NextResponse } from 'next/server';
import { ClassApiResponse } from '@/types'; // Adjust the import path as necessary

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ClassApiResponse>> {
  try {
    const { id: classId } = await params;
    
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    const backendUrl = `${process.env.BACKEND_API_URL}/classes/${classId}`;
    
    console.log('Fetching class from:', backendUrl);
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json'
      },
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
            error: errorData.message || `Failed to fetch class with ID: ${classId}`,
            status: response.status 
          },
          { status: response.status }
        );
      } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json(
          { 
            success: false,
            error: `Failed to fetch class: ${response.statusText}`,
            status: response.status 
          },
          { status: response.status }
        );
      }
    }
    
    const classData = await response.json();
    console.log('Successfully fetched class:', classData);
    
    return NextResponse.json({
      success: true,
      data: classData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error in API route:`, error);
    
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