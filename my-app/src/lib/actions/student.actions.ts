'use server';

const {
  NEXT_PUBLIC_API_URL: API_URL
} = process.env;

export const getStudentById = async (id: string): Promise<Student> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch student: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};