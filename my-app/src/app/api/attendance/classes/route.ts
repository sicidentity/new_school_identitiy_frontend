// app/api/attendance/classes/route.ts
import { NextResponse } from 'next/server';

// Mock data for development
const mockClasses = [
  {
    id: 'c1',
    name: 'Mathematics',
    description: 'Advanced calculus and algebra',
    students: [
      { id: 1001, name: 'John Doe' },
      { id: 1002, name: 'Jane Smith' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Science',
    description: 'Physics and chemistry',
    students: [
      { id: 1003, name: 'Michael Johnson' },
      { id: 1004, name: 'Emily Williams' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'History',
    description: 'World history',
    students: [
      { id: 1005, name: 'Robert Brown' },
      { id: 1006, name: 'Sarah Davis' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    // In development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for classes');
      
      return NextResponse.json({
        success: true,
        data: mockClasses,
        timestamp: new Date().toISOString()
      });
    }
    
    // In production, use the real API
    const backendUrl = `${process.env.BACKEND_API_URL}/classes`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch classes' },
        { status: response.status }
      );
    }

    const classes = await response.json();
    
    return NextResponse.json({
      success: true,
      data: classes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching classes:', error);
    
    // If in development, return mock data even on error
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock data after error');
      
      return NextResponse.json({
        success: true,
        data: mockClasses,
        timestamp: new Date().toISOString()
      });
    }
    
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