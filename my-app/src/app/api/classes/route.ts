// POST /api/classes - Handles creation of a new class
// src/app/api/classes/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, students } = body;

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Class name is required and must be a non-empty string.' }, { status: 400 });
    }
    if (description !== undefined && typeof description !== 'string') {
        return NextResponse.json({ success: false, error: 'Description must be a string.' }, { status: 400 });
    }
    if (students !== undefined && (!Array.isArray(students) || !students.every(s => typeof s === 'string'))) {
        return NextResponse.json({ success: false, error: 'Students must be an array of student IDs (strings).' }, { status: 400 });
    }

    // Prepare data for the backend API - keep the same structure
    const backendPayload: { name: string; description?: string; students?: string[] } = { name };
    if (description !== undefined) {
      backendPayload.description = description;
    }
    if (students !== undefined && students.length > 0) {
      backendPayload.students = students;
    }

    // Make the backend request
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    // Check if the response is actually JSON before parsing
    const contentType = backendResponse.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await backendResponse.text();
      console.error('Backend returned non-JSON response:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        contentType,
        body: textResponse
      });
      
      return NextResponse.json(
        { success: false, error: 'Backend server error. Please try again later.' },
        { status: 500 }
      );
    }

    // Safely parse the JSON response
    let responseData;
    try {
      responseData = await backendResponse.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response from backend:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid response format from backend server.' },
        { status: 502 }
      );
    }

    // Handle backend errors (non-2xx status codes)
    if (!backendResponse.ok) {
      console.error('Backend error during class creation:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        responseData
      });
      
      // Extract error message from backend response
      const backendError = responseData?.error || responseData?.message || `Backend error (${backendResponse.status})`;
      
      return NextResponse.json(
        { success: false, error: backendError },
        { status: backendResponse.status }
      );
    }

    // Success case - your backend now returns the class object directly
    console.log('Class created successfully:', responseData);
    return NextResponse.json(
      { 
        success: true, 
        data: responseData // Backend returns class object directly, not wrapped in data property
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/classes:', error);
    
    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { success: false, error: 'Unable to connect to backend server. Please check your network connection.' },
        { status: 503 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json(
      { success: false, error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/classes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check content type before parsing
    const contentType = backendResponse.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await backendResponse.text();
      console.error('Backend returned non-JSON response:', textResponse);
      
      return NextResponse.json(
        { error: 'Backend server error' },
        { status: backendResponse.status || 500 }
      );
    }

    let responseData;
    try {
      responseData = await backendResponse.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from backend' },
        { status: 500 }
      );
    }

    if (!backendResponse.ok) {
      console.error('Backend error during classes fetch:', responseData);
      return NextResponse.json(
        { error: responseData.message || 'Failed to fetch classes' },
        { status: backendResponse.status }
      );
    }

    // Return the classes data
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in GET /api/classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/:id - Deletes a class
export async function DELETE(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('id');
    if (!classId) {
      console.error('No class ID provided in query string');
      return NextResponse.json({ success: false, error: 'No class ID provided in query string' }, { status: 400 });
    }

    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/classes/${classId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary Authorization headers here
      },
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('Backend error during class deletion:', responseData);
      throw new Error(responseData.error || responseData.message || `Failed to delete class. Status: ${backendResponse.status}`);
    }

    // Assuming the backend returns the deleted class object or a success message with data
    return NextResponse.json({ success: true, data: responseData.data || responseData }, { status: 200 });

  } catch (error) {
    console.error('Error in DELETE /api/classes/:id:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
