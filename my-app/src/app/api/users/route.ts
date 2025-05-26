// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { Role } from '../../interface/testapi';

// Define a simplified user interface for frontend use
interface FrontendUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

// Define our own API response type using the FrontendUser
interface FrontendUserApiResponse {
  success: boolean;
  data?: FrontendUser[];
  error?: string;
  details?: string;
  timestamp?: string;
}



export async function GET(): Promise<NextResponse<FrontendUserApiResponse>> {
  try {
    if (!process.env.BACKEND_API_URL) {
      throw new Error('Missing BACKEND_API_URL environment variable');
    }
    
    const backendUrl = `${process.env.BACKEND_API_URL}/auth`;
    console.log('Fetching users from:', backendUrl);
    
    const response = await fetch(backendUrl, {
      headers: {
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
    
    const backendData = await response.json();
    console.log('Backend response:', backendData);
    
    // Check the actual structure of the response
    let users: FrontendUser[] = [];
    
    // Handle different possible response formats
    if (Array.isArray(backendData)) {
      // If the response is already an array of users
      users = backendData.map((user: any) => ({
        id: user.id?.toString() || Math.random().toString(36).substr(2, 9),
        name: user.name || 'Unknown User',
        email: user.email || 'no-email@example.com',
        role: user.role || Role.SECURITY,
        avatarUrl: '/api/placeholder/32/32'
      }));
    } else if (backendData.data && Array.isArray(backendData.data)) {
      // If the response has a data property containing the array
      users = backendData.data.map((user: any) => ({
        id: user.id?.toString() || Math.random().toString(36).substr(2, 9),
        name: user.name || 'Unknown User',
        email: user.email || 'no-email@example.com',
        role: user.role || Role.SECURITY,
        avatarUrl: '/api/placeholder/32/32'
      }));
    } else if (backendData.users && Array.isArray(backendData.users)) {
      // If the response has a users property containing the array
      users = backendData.users.map((user: any) => ({
        id: user.id?.toString() || Math.random().toString(36).substr(2, 9),
        name: user.name || 'Unknown User',
        email: user.email || 'no-email@example.com',
        role: user.role || Role.SECURITY,
        avatarUrl: '/api/placeholder/32/32'
      }));
    } else {
      // If we can't determine the structure, create a mock user for testing
      console.log('Could not determine user data structure, using mock data');
      users = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: Role.ADMIN,
          avatarUrl: '/api/placeholder/32/32'
        },
        {
          id: '2',
          name: 'Security User',
          email: 'security@example.com',
          role: Role.SECURITY,
          avatarUrl: '/api/placeholder/32/32'
        }
      ];
    }
    
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