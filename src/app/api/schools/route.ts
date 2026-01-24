// app/api/schools/route.ts
import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

/**
 * GET /api/schools - Fetch all schools
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/schools`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch schools' }));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to fetch schools' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
