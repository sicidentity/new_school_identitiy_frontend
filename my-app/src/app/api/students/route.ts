// app/api/students/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Backblaze B2 Configuration
const B2_ACCOUNT_ID = process.env.B2_ACCOUNT_ID
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME
const B2_BUCKET_ID = process.env.B2_BUCKET_ID
const B2_ENDPOINT = `https://s3.${process.env.B2_REGION}.backblazeb2.com`
const BACKEND_API_URL = process.env.BACKEND_API_URL

// Helper function to upload files to Backblaze B2
async function uploadToBackblaze(file: File) {
  if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY) {
    throw new Error('Backblaze credentials not configured')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  
  // Get upload authorization
  const authResponse = await fetch(
    `https://api.backblazeb2.com/b2api/v2/b2_get_upload_url?bucketId=${B2_BUCKET_ID}`,
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`).toString('base64')}`
      }
    }
  )
  
  const { uploadUrl, authorizationToken } = await authResponse.json()
  
  // Upload file
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': authorizationToken,
      'Content-Type': file.type,
      'X-Bz-File-Name': encodeURIComponent(fileName),
      'X-Bz-Content-Sha1': 'do_not_verify'
    },
    body: await file.arrayBuffer()
  })
  
  const { fileId, fileName: uploadedFileName } = await uploadResponse.json()
  
  return {
    url: `${B2_ENDPOINT}/${B2_BUCKET_NAME}/${uploadedFileName}`,
    fileId
  }
}

// Helper function to delete files from Backblaze B2
async function deleteFromBackblaze(fileId: string) {
  if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY) {
    throw new Error('Backblaze credentials not configured')
  }

  await fetch('https://api.backblazeb2.com/b2api/v2/b2_delete_file_version', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${B2_ACCOUNT_ID}:${B2_APPLICATION_KEY}`).toString('base64')}`
    },
    body: JSON.stringify({
      fileId: fileId,
      fileName: `${B2_BUCKET_NAME}/${fileId}` // Adjust based on your naming convention
    })
  })
}

export async function GET(request: Request) {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    console.log('Fetching students data from backend API')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const backendUrl = id 
      ? `${process.env.BACKEND_API_URL}/students/${id}`
      : `${process.env.BACKEND_API_URL}/students`

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
    const formData = await request.formData()
    const file = formData.get('picture') as File | null
    
    // Upload to Backblaze B2
    let pictureData = null
    if (file) {
      pictureData = await uploadToBackblaze(file)
    }

    // Prepare data for backend
    const studentData = {
      name: formData.get('name'),
      age: formData.get('age'),
      classId: formData.get('classId'),
      parentId: formData.get('parentId'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      picture: pictureData?.url || null,
      b2FileId: pictureData?.fileId || null
    }

    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    console.log('Sending student data to:', `${process.env.BACKEND_API_URL}/students`);
    
    // Send to main backend
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    })

    if (!backendResponse.ok) {
      // Clean up uploaded file if backend failed
      if (pictureData?.fileId) {
        await deleteFromBackblaze(pictureData.fileId)
      }
      
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { success: false, error: errorData.message || 'Backend request failed' },
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

    // Get existing student data
    const existingStudent = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())

    let pictureData = null
    let oldFileId = null

    // Handle file upload if new picture provided
    if (file) {
      // Upload new file
      pictureData = await uploadToBackblaze(file)
      oldFileId = existingStudent.data.b2FileId
    }

    // Prepare update data
    const updateData = {
      name: formData.get('name') || existingStudent.data.name,
      age: formData.get('age') || existingStudent.data.age,
      classId: formData.get('classId') || existingStudent.data.classId,
      parentId: formData.get('parentId') || existingStudent.data.parentId,
      email: formData.get('email') || existingStudent.data.email,
      phone: formData.get('phone') || existingStudent.data.phone,
      picture: pictureData?.url || existingStudent.data.picture,
      b2FileId: pictureData?.fileId || existingStudent.data.b2FileId
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
      if (pictureData?.fileId) {
        await deleteFromBackblaze(pictureData.fileId)
      }
      
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to update student' },
        { status: backendResponse.status }
      )
    }

    // Delete old file if new one was uploaded
    if (oldFileId && pictureData) {
      await deleteFromBackblaze(oldFileId)
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

    // Get student data to find B2 file ID
    const student = await fetch(`${BACKEND_API_URL}/students/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())

    // Delete from Backblaze B2
    if (student.data.b2FileId) {
      await deleteFromBackblaze(student.data.b2FileId)
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