// app/api/students/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Backblaze B2 Configuration
const B2_ACCOUNT_ID = process.env.B2_ACCOUNT_ID
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY
const B2_BUCKET_ID = process.env.B2_BUCKET_ID
const BACKEND_API_URL = process.env.BACKEND_API_URL
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME

/**
 * Uploads a file to Backblaze B2
 */
async function uploadToBackblaze(file: File) {
  try {
    // Validate credentials
    if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY || !B2_BUCKET_ID) {
      throw new Error('Backblaze credentials not configured')
    }

    // Validate file
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty or null')
    }

    console.log(`Preparing to upload file: ${file.name}, size: ${file.size} bytes`)

    // 1. Authorize account
    const authString = `${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`
    const base64Auth = Buffer.from(authString).toString('base64')
    
    console.log('Authorizing with Backblaze...')
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64Auth}`,
      },
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Backblaze authorization failed: ${errorText}`)
    }

    const authData = await authResponse.json()
    console.log('Authorization successful, API URL:', authData.apiUrl)

    // 2. Get upload URL
    const uploadUrlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        Authorization: authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
    })

    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text()
      throw new Error(`Failed to get upload URL: ${errorText}`)
    }

    const { uploadUrl, authorizationToken } = await uploadUrlResponse.json()
    console.log('Got upload URL:', uploadUrl)

    // 3. Prepare file for upload
    const fileExt = file.name.split('.').pop() || 'bin'
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const fileBuffer = await file.arrayBuffer()
    const hashSum = crypto.createHash('sha1')
    hashSum.update(new Uint8Array(fileBuffer))
    const sha1Hash = hashSum.digest('hex')

    // 4. Upload file
    console.log(`Uploading ${fileName} to Backblaze...`)
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: authorizationToken,
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': file.size.toString(),
        'X-Bz-File-Name': encodeURIComponent(fileName),
        'X-Bz-Content-Sha1': sha1Hash,
      },
      body: fileBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(`Upload failed: ${errorText}`)
    }

    const uploadResult = await uploadResponse.json()
    console.log('Upload successful:', uploadResult.fileName)

    return {
      url: uploadResult.downloadUrl || `https://f003.backblazeb2.com/file/${B2_BUCKET_NAME}/${uploadResult.fileName}`,
      fileId: uploadResult.fileId,
      fileName: uploadResult.fileName,
    }
  } catch (error) {
    console.error('Error in uploadToBackblaze:', error)
    throw error
  }
}

/**
 * Deletes a file from Backblaze B2
 */
async function deleteFromBackblaze(fileId: string, fileName: string) {
  try {
    // 1. Authorize account
    const authString = `${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`
    const base64Auth = Buffer.from(authString).toString('base64')
    
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64Auth}`,
      },
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Backblaze authorization failed: ${errorText}`)
    }

    const authData = await authResponse.json()

    // 2. Delete file
    const deleteResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_delete_file_version`, {
      method: 'POST',
      headers: {
        Authorization: authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        fileName,
      }),
    })

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      throw new Error(`File deletion failed: ${errorText}`)
    }

    return await deleteResponse.json()
  } catch (error) {
    console.error('Error in deleteFromBackblaze:', error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable')
    }
    
    console.log('Fetching students data from backend API')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const backendUrl = id 
      ? `${BACKEND_API_URL}/students/${id}`
      : `${BACKEND_API_URL}/students`

    console.log('Fetching from URL:', backendUrl)

    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to fetch students:', errorData)
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to fetch students' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Fetch students error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('picture') as File | null
    
    // Validate that picture is provided
    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Student picture is required' },
        { status: 400 }
      )
    }
    
    // Process file upload
    let pictureData = null
    try {
      // Check if Backblaze credentials are configured
      if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY || !B2_BUCKET_ID) {
        return NextResponse.json(
          { success: false, error: 'File storage is not properly configured' },
          { status: 500 }
        )
      }
      
      pictureData = await uploadToBackblaze(file)
      console.log('Picture uploaded successfully:', pictureData)  
      
      if (!pictureData || !pictureData.url) {
        return NextResponse.json(
          { success: false, error: 'Failed to upload student picture' },
          { status: 500 }
        )
      }
      
      console.log('Picture uploaded successfully:', pictureData.url)
    } catch (uploadError) {
      console.error('File upload error:', uploadError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload student picture', 
          details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
        },
        { status: 500 }
      )
    }

    // Prepare student data
    const studentData = {
      name: formData.get('name') as string,
      age: Number(formData.get('age')),
      classId: formData.get('classId') as string,
      parentId: formData.get('parentId') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      regNumber:
        Array(6)
          .fill('')
          .map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26)))
          .join('') + Math.floor(1000 + Math.random() * 9000).toString(),
      admissionDate: new Date(formData.get('admissionDate') as string),
      address: formData.get('address') as string,
      picture: pictureData?.url || null,
      b2FileId: pictureData?.fileId || null,
      b2FileName: pictureData?.fileName || null,
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable')
    }
    
    console.log('Sending student data to:', `${BACKEND_API_URL}/students`)
    
    const backendResponse = await fetch(`${BACKEND_API_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    })

    if (!backendResponse.ok) {
      // Clean up uploaded file if backend failed
      if (pictureData?.fileId && pictureData?.fileName) {
        try {
          await deleteFromBackblaze(pictureData.fileId, pictureData.fileName)
        } catch (deleteError) {
          console.error('Failed to clean up uploaded file:', deleteError)
        }
      }
      
      let errorMessage = 'Backend request failed';
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If response is not valid JSON, use text content or status text
        try {
          errorMessage = await backendResponse.text() || backendResponse.statusText;
        } catch (textError) {
          console.error('Failed to parse error response:', textError);
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Student created successfully'
    })

  } catch (error) {
    console.error('Student creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    const id = formData.get('id')
    const file = formData.get('picture') as File | null
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable')
    }

    // Get existing student data
    const existingStudentResponse = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!existingStudentResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch existing student data' },
        { status: existingStudentResponse.status }
      )
    }

    const existingStudent = await existingStudentResponse.json()

    let pictureData = null
    let oldFileId = null
    let oldFileName = null

    // Handle file upload if new picture provided
    if (file && file.size > 0) {
      try {
        // Check if Backblaze credentials are configured
        if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY || !B2_BUCKET_ID) {
          return NextResponse.json(
            { success: false, error: 'File storage is not properly configured' },
            { status: 500 }
          )
        }
        
        pictureData = await uploadToBackblaze(file)
        
        if (!pictureData || !pictureData.url) {
          return NextResponse.json(
            { success: false, error: 'Failed to upload student picture' },
            { status: 500 }
          )
        }
        
        oldFileId = existingStudent.data.b2FileId
        oldFileName = existingStudent.data.b2FileName
      } catch (uploadError) {
        console.error('File upload error during update:', uploadError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to upload new student picture', 
            details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
          },
          { status: 500 }
        )
      }
    }

    // Prepare update data
    const updateData = {
      name: formData.get('name') || existingStudent.data.name,
      age: formData.get('age') ? Number(formData.get('age')) : existingStudent.data.age,
      classId: formData.get('classId') || existingStudent.data.classId,
      parentId: formData.get('parentId') || existingStudent.data.parentId,
      email: formData.get('email') || existingStudent.data.email,
      phone: formData.get('phone') || existingStudent.data.phone,
      address: formData.get('address') || existingStudent.data.address,
      picture: pictureData?.url || existingStudent.data.picture,
      b2FileId: pictureData?.fileId || existingStudent.data.b2FileId,
      b2FileName: pictureData?.fileName || existingStudent.data.b2FileName
    }

    // Update backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    if (!backendResponse.ok) {
      // Clean up new file if update failed
      if (pictureData?.fileId && pictureData?.fileName) {
        try {
          await deleteFromBackblaze(pictureData.fileId, pictureData.fileName)
        } catch (deleteError) {
          console.error('Failed to clean up new uploaded file:', deleteError)
        }
      }
      
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to update student' },
        { status: backendResponse.status }
      )
    }

    // Delete old file if new one was uploaded successfully
    if (oldFileId && oldFileName && pictureData) {
      try {
        await deleteFromBackblaze(oldFileId, oldFileName)
      } catch (deleteError) {
        console.error('Failed to delete old file:', deleteError)
        // Don't fail the request if old file deletion fails
      }
    }

    const result = await backendResponse.json()
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Student updated successfully'
    })

  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      )
    }

    if (!BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable')
    }

    // Get student data to find B2 file info
    const studentResponse = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!studentResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch student data' },
        { status: studentResponse.status }
      )
    }

    const student = await studentResponse.json()

    // Delete from Backblaze B2 first
    if (student.data.b2FileId && student.data.b2FileName) {
      try {
        await deleteFromBackblaze(student.data.b2FileId, student.data.b2FileName)
      } catch (deleteError) {
        console.error('Failed to delete file from B2:', deleteError)
        // Continue with backend deletion even if B2 deletion fails
      }
    }

    // Delete from backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to delete student' },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    })

  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}