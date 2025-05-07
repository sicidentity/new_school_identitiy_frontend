// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { User, Role, UserApiResponse } from '@/app/interface/testapi';



export async function GET(): Promise<NextResponse<UserApiResponse>> {
  try {
    if (!process.env.BACKEND_API_URL || !process.env.API_TOKEN) {
      throw new Error('Missing required environment variables');
    }
    
    const backendUrl = `${process.env.BACKEND_API_URL}/users`;
    
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
        { 
          success: false,
          error: errorData.message || 'Failed to fetch users' 
        },
        { status: response.status }
      );
    }
    
    const backendUsers = await response.json();
    
    // Transform backend user format to match the format expected by the frontend
    const users: User[] = backendUsers.map((user: User) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || Role.SECURITY, // Use the Role enum from your interface
      avatarUrl: '/api/placeholder/32/32'
    }));
    
    return NextResponse.json({
      success: true,
      data: users,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching users:', error);
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