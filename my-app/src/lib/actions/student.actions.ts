'use server';

import { Student } from "@/types/models";

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

    const data = await response.json();

    // Transform the API response to match the Student type
    const student: Student = {
      id: data.id,
      name: data.name,
      age: data.age,
      phone: data.phone || '',
      email: data.email || '',
      regNumber: data.regNumber || '',
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
      address: data.address || '',
      classId: data.classId,
      parentId: data.parentId,
      picture: data.picture,
      b2FileId: data.b2FileId,
      b2FileName: data.b2FileName,
      class: data.class,
      parent: data.parent,
      qrCodes: data.qrCode || [],
      attendances: data.attendances || [],
      smsNotifications: data.smsNotifications || [],
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
    };

    return student;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};