// app/api/parents/route.ts
import { NextResponse } from 'next/server';
import { Parent, ApiResponse } from '@/types/models';
import crypto from 'crypto';

// Backblaze B2 Configuration for parents
const B2_ACCOUNT_ID = process.env.PARENTS_ACCOUNT_ID;
const B2_APPLICATION_KEY = process.env.PARENTS_APPLICATION_KEY;
const B2_BUCKET_ID = process.env.PARENTS_BUCKET_ID;
const BACKEND_API_URL = process.env.BACKEND_API_URL;
const B2_BUCKET_NAME = process.env.PARENTS_BUCKET_NAME;

/**
 * Uploads a file to Backblaze B2 (parents bucket)
 */
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


// Define our own API response type
type ParentsApiResponse = ApiResponse<Parent[]>;

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('picture') as File | null;

    // Validate that picture is provided (optional for parents, so skip this check if not required)
    let pictureData = null;
    if (file && file.size > 0) {
      try {
        if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY || !B2_BUCKET_ID) {
          return NextResponse.json(
            { success: false, error: 'File storage is not properly configured' },
            { status: 500 }
          );
        }
        pictureData = await uploadToBackblaze(file);
        console.log('Parent picture uploaded successfully:', pictureData);
        console.log('PICTURE URL!!!!!!!!!!!!: ', pictureData.url);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to upload parent picture',
            details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
          },
          { status: 500 }
        );
      }
    }

    // Prepare parent data
    const parentData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      picture: pictureData?.url,
    };

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/parents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parentData),
    });

    if (!backendResponse.ok) {
      // Clean up uploaded file if backend failed
      if (pictureData?.fileId && pictureData?.fileName) {
        try {
          await deleteFromBackblaze(pictureData.fileId, pictureData.fileName);
        } catch (deleteError) {
          console.error('Failed to clean up uploaded file:', deleteError);
        }
      }

      let errorMessage = 'Backend request failed';
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch (textError) {
        console.error('Failed to parse backend response:', textError);
        try {
          errorMessage = await backendResponse.text() || backendResponse.statusText;
        } catch (textError) {
          console.error('Failed to get backend response text:', textError);
        }
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Parent created successfully',
    });
  } catch (error) {
    console.error('Parent creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


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


