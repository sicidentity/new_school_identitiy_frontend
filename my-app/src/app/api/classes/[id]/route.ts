import { NextRequest, NextResponse } from 'next/server'
import { ClassApiResponse } from '@/types'

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }

    // Check content type
    const contentType = request.headers.get('content-type') || '';
    let updateData: any = {};

    // Handle form data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract fields (classes don't have files)
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          try {
            // Try to parse JSON strings
            updateData[key] = JSON.parse(value);
          } catch {
            updateData[key] = value;
          }
        }
      });
    } 
    // Handle JSON data
    else if (contentType.includes('application/json')) {
      updateData = await request.json();
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    // Update class record
    const updateResponse = await fetch(`${BACKEND_API_URL}/classes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    // Handle update failure
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      return NextResponse.json(
        { success: false, error: `Failed to update class: ${errorText}` },
        { status: updateResponse.status }
      );
    }

    const updatedClass = await updateResponse.json();
    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ClassApiResponse>> {
  try {
    // Await the params Promise to get the actual params object
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }

    const response = await fetch(`${BACKEND_API_URL}/classes/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch class' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Await the params Promise to get the actual params object
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }

    const response = await fetch(`${BACKEND_API_URL}/classes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete class' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
