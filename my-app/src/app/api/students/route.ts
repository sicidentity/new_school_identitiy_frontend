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
const API_TOKEN = process.env.API_TOKEN

// Mock data for development
const mockStudents = [
  {
    id: 1001,
    name: "John Doe",
    age: 15,
    classId: "c1",
    parentId: "p1",
    email: "john@example.com",
    phone: "1234567890",
    picture: "https://randomuser.me/api/portraits/men/1.jpg",
    class: { name: "Mathematics" }
  },
  {
    id: 1002,
    name: "Jane Smith",
    age: 16,
    classId: "c1",
    parentId: "p2",
    email: "jane@example.com",
    phone: "0987654321",
    picture: "https://randomuser.me/api/portraits/women/1.jpg",
    class: { name: "Mathematics" }
  },
  {
    id: 1003,
    name: "Michael Johnson",
    age: 15,
    classId: "c2",
    parentId: "p3",
    email: "michael@example.com",
    phone: "5556667777",
    picture: "https://randomuser.me/api/portraits/men/2.jpg",
    class: { name: "Science" }
  },
  {
    id: 1004,
    name: "Emily Williams",
    age: 16,
    classId: "c2",
    parentId: "p4",
    email: "emily@example.com",
    phone: "1112223333",
    picture: "https://randomuser.me/api/portraits/women/2.jpg",
    class: { name: "Science" }
  },
  {
    id: 1005,
    name: "Robert Brown",
    age: 15,
    classId: "c3",
    parentId: "p5",
    email: "robert@example.com",
    phone: "4445556666",
    picture: "https://randomuser.me/api/portraits/men/3.jpg",
    class: { name: "History" }
  }
];

export const dynamic = 'force-dynamic'

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
    // In development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for students');
      
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (id) {
        // Return a specific student
        const student = mockStudents.find(s => s.id.toString() === id);
        
        if (!student) {
          return NextResponse.json(
            { success: false, error: 'Student not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: student,
          timestamp: new Date().toISOString()
        });
      }
      
      // Return all students
      return NextResponse.json({
        success: true,
        data: mockStudents,
        timestamp: new Date().toISOString()
      });
    }
    
    // If not in development, use the real API
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const backendUrl = id 
      ? `${BACKEND_API_URL}/students/${id}`
      : `${BACKEND_API_URL}/students`

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
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
    
    // If in development, return mock data even on error
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data after error');
      
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (id) {
        // Return a specific student
        const student = mockStudents.find(s => s.id.toString() === id);
        
        if (!student) {
          return NextResponse.json(
            { success: false, error: 'Student not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: student,
          timestamp: new Date().toISOString()
        });
      }
      
      // Return all students
      return NextResponse.json({
        success: true,
        data: mockStudents,
        timestamp: new Date().toISOString()
      });
    }
    
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

    // Send to main backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
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
        'Authorization': `Bearer ${API_TOKEN}`,
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
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
        'Authorization': `Bearer ${API_TOKEN}`,
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
        'Authorization': `Bearer ${API_TOKEN}`,
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