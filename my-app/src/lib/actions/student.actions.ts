'use server';

import { revalidatePath } from 'next/cache';

const { NEXT_PUBLIC_API_URL: API_URL } = process.env;

export const GetStudents = async (): Promise<Student[]> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const getStudentById = async (id: number): Promise<Student> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/student/${id}`, {
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

export const createStudent = async (formData: FormData | StudentInput): Promise<Student> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    // Convert FormData to regular object if needed
    const studentData = formData instanceof FormData ? Object.fromEntries(formData) : formData;
    
    // Parse numeric fields
    if (formData instanceof FormData) {
      studentData.age = parseInt(studentData.age as string, 10);
      studentData.parentId = parseInt(studentData.parentId as string, 10);
    }

    // Validate required fields
    if (!studentData.name || !studentData.email || !studentData.age || !studentData.classId || !studentData.parentId) {
      throw new Error("Missing required fields");
    }

    const response = await fetch(`${API_URL}/student/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create student: ${response.status}`);
    }

    // Revalidate the students page to update the UI
    revalidatePath('/students');
    revalidatePath('/classes'); // Also revalidate classes as they might display student counts
    
    return await response.json();
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
};

export const updateStudent = async (id: number, formData: FormData | Partial<StudentInput>): Promise<Student> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    // Convert FormData to regular object if needed
    const studentData = formData instanceof FormData ? Object.fromEntries(formData) : formData;
    
    // Parse numeric fields if present
    if (formData instanceof FormData) {
      if (studentData.age) studentData.age = parseInt(studentData.age as string, 10);
      if (studentData.parentId) studentData.parentId = parseInt(studentData.parentId as string, 10);
    }

    const response = await fetch(`${API_URL}/student/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update student: ${response.status}`);
    }

    // Revalidate both the list and the detail pages
    revalidatePath('/students');
    revalidatePath(`/students/${id}`);
    revalidatePath('/classes'); // Also revalidate classes as they might display student counts
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

export const deleteStudent = async (id: number): Promise<DeleteResponse> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/student/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete student: ${response.status}`);
    }

    // Revalidate relevant pages
    revalidatePath('/students');
    revalidatePath('/classes'); // Also revalidate classes as they might display student counts
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};