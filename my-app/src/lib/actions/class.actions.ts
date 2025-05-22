'use server';

import { revalidatePath } from 'next/cache';

const {
  NEXT_PUBLIC_API_URL: API_URL
} = process.env;

export const getClasses = async (): Promise<Class[]> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/classes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch classes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

export const getClassById = async (id: string): Promise<Class> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/class/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch class: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching class ${id}:`, error);
    throw error;
  }
};

export const createClass = async (formData: FormData | ClassInput): Promise<Class> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    // Convert FormData to regular object if needed
    const classData = Object.fromEntries(formData instanceof FormData ? formData : []);

    const response = await fetch(`${API_URL}/class/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create class: ${response.status}`);
    }

    // Revalidate the classes page to update the UI
    revalidatePath('/classes');
    
    return await response.json();
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

export const updateClass = async (id: string, formData: FormData | ClassInput): Promise<Class> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    // Convert FormData to regular object if needed
    const classData = Object.fromEntries(formData instanceof FormData ? formData : []);

    const response = await fetch(`${API_URL}/class/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update class: ${response.status}`);
    }

    // Revalidate both the list and the detail pages
    revalidatePath('/classes');
    revalidatePath(`/classes/${id}`);
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating class ${id}:`, error);
    throw error;
  }
};

export const deleteClass = async (id: string): Promise<DeleteResponse> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/class/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete class: ${response.status}`);
    }

    // Revalidate the classes page to update the UI
    revalidatePath('/classes');
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting class ${id}:`, error);
    throw error;
  }
};
