// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { StudentApiResponse } from '@/types';

// Payload type for updating a student
type StudentUpdatePayload = {
  [key: string]: unknown;
  picture?: string;
  b2FileId?: string;
  b2FileName?: string;
  phone?: string;
  age?: number;
  admissionDate?: string; // ISO string
};

const B2_ACCOUNT_ID = process.env.B2_ACCOUNT_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;
const BACKEND_API_URL = process.env.BACKEND_API_URL;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;

async function uploadToBackblaze(file: File) {
  if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY || !B2_BUCKET_ID) {
    throw new Error('Backblaze credentials not configured');
  }
  if (!file || file.size === 0) {
    throw new Error('Invalid file: File is empty or null');
  }
  const authString = `${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`;
  const base64Auth = Buffer.from(authString).toString('base64');
  // 1. Authorize account
  const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: { Authorization: `Basic ${base64Auth}` },
  });
  if (!authResponse.ok) {
    throw new Error('Backblaze authorization failed: ' + (await authResponse.text()));
  }
  const authData = await authResponse.json();
  // 2. Get upload URL
  const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      Authorization: authData.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
  });
  if (!uploadUrlResponse.ok) {
    throw new Error('Failed to get Backblaze upload URL: ' + (await uploadUrlResponse.text()));
  }
  const uploadUrlData = await uploadUrlResponse.json();
  // 3. Upload file
  const fileName = `${crypto.randomUUID()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const sha1 = crypto.createHash('sha1').update(Buffer.from(arrayBuffer)).digest('hex');
  const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: uploadUrlData.authorizationToken,
      'X-Bz-File-Name': encodeURIComponent(fileName),
      'Content-Type': file.type,
      'X-Bz-Content-Sha1': sha1,
    },
    body: Buffer.from(arrayBuffer),
  });
  if (!uploadResponse.ok) {
    throw new Error('Backblaze upload failed: ' + (await uploadResponse.text()));
  }
  const uploadData = await uploadResponse.json();
  // Compose the file URL
  const url = `https://f003.backblazeb2.com/file/${B2_BUCKET_NAME}/${uploadData.fileName}`;
  
  return {
    url,
    fileId: uploadData.fileId,
    fileName,
  };
}

/**
 * Deletes a file from Backblaze B2 (parents bucket)
 */
async function deleteFromBackblaze(fileId: string, fileName: string) {
  if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY) return;
  const authString = `${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`;
  const base64Auth = Buffer.from(authString).toString('base64');
  const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: { Authorization: `Basic ${base64Auth}` },
  });
  if (!authResponse.ok) return;
  const authData = await authResponse.json();
  await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_file_version`, {
    method: 'POST',
    headers: {
      Authorization: authData.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileId, fileName }),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }

    // Check content type
    const contentType = request.headers.get('content-type') || '';
    let updateData: StudentUpdatePayload = {};
    let newFile: File | null = null;
    let oldFileData: { fileId: string; fileName: string } | null = null;

    // Handle form data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract non-file fields
      formData.forEach((value, key) => {
        if (key !== 'picture' && typeof value === 'string') {
          try {
            // Try to parse JSON strings
            const parsed = JSON.parse(value);
            // Ensure phone number remains a string
            if (key === 'phone') {
              updateData[key] = String(parsed);
            } else {
              updateData[key] = parsed;
            }
          } catch {
            // Handle specific student fields
            if (key === 'age') {
              updateData[key] = parseInt(value);
            } else if (key === 'admissionDate') {
              updateData[key] = new Date(value).toISOString();
            } else if (key === 'phone') {
              // Ensure phone is always a string
              updateData[key] = String(value);
            } else {
              updateData[key] = value;
            }
          }
        }
      });

      // Handle file upload if exists
      const picture = formData.get('picture');
      if (picture instanceof File && picture.size > 0) {
        newFile = picture;
      }
    } 
    // Handle JSON data
    else if (contentType.includes('application/json')) {
      updateData = (await request.json()) as StudentUpdatePayload;
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    // Handle image upload for students
    let newPictureData: { url: string; fileId: string; fileName: string } | null = null;

    if (newFile) {
      try {
        // Get current student data to access old file info
        const currentResponse = await fetch(`${BACKEND_API_URL}/students/${id}`);
        if (!currentResponse.ok) throw new Error('Failed to fetch student data');
        const currentStudent = await currentResponse.json();
        
        // Save old file info for cleanup
        if (currentStudent.b2FileId && currentStudent.b2FileName) {
          oldFileData = {
            fileId: currentStudent.b2FileId,
            fileName: currentStudent.b2FileName
          };
        }

        // Upload new image
        newPictureData = await uploadToBackblaze(newFile);
        updateData.picture = newPictureData.url;
        updateData.b2FileId = newPictureData.fileId;
        updateData.b2FileName = newPictureData.fileName;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload new image' },
          { status: 500 }
        );
      }
    }

    // Update student record
    const updateResponse = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    // Handle update failure
    if (!updateResponse.ok) {
      // Clean up new image if update failed
      if (newPictureData) {
        try {
          await deleteFromBackblaze(newPictureData.fileId, newPictureData.fileName);
        } catch (deleteError) {
          console.error('Cleanup failed:', deleteError);
        }
      }
      const errorText = await updateResponse.text();
      return NextResponse.json(
        { success: false, error: `Failed to update student: ${errorText}` },
        { status: updateResponse.status }
      );
    }

    // Clean up old image after successful update
    if (oldFileData) {
      try {
        await deleteFromBackblaze(oldFileData.fileId, oldFileData.fileName);
      } catch (deleteError) {
        console.error('Old image deletion failed:', deleteError);
        // Not critical, just log
      }
    }

    const updatedStudent = await updateResponse.json();
    return NextResponse.json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<StudentApiResponse>> {
  try {
    // Await the params Promise to get the actual params object
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }

    const response = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch Student' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching Student:', error);
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
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }

    const response = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete Student' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error deleting Student:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}