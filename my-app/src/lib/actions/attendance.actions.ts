'use server';

import { revalidatePath } from 'next/cache';

const { NEXT_PUBLIC_API_URL: API_URL } = process.env;

export const markCheckIn = async (
  data: { studentId: number; classId: string }
): Promise<Attendance> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to check in: ${response.status}`);
    }

    // Revalidate relevant paths
    revalidatePath('/attendance');
    revalidatePath(`/students/${data.studentId}`);
    revalidatePath(`/classes/${data.classId}`);

    return await response.json();
  } catch (error) {
    console.error("Check-in error:", error);
    throw error;
  }
};

export const markCheckOut = async (
  data: { studentId: number; classId: string }
): Promise<Attendance> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to check out: ${response.status}`);
    }

    // Revalidate relevant paths
    revalidatePath('/attendance');
    revalidatePath(`/students/${data.studentId}`);
    revalidatePath(`/classes/${data.classId}`);

    return await response.json();
  } catch (error) {
    console.error("Check-out error:", error);
    throw error;
  }
};

export const checkIn = async (qrCode: string): Promise<CheckInOutResponse> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/check-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ qrCode })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to check in: ${response.status}`);
    }

    const data = await response.json();
    
    // Revalidate relevant paths
    revalidatePath('/attendance');
    revalidatePath(`/students/${data.attendance.studentId}`);
    revalidatePath(`/classes/${data.attendance.classId}`);

    return data;
  } catch (error) {
    console.error("QR check-in error:", error);
    throw error;
  }
};

export const checkOut = async (qrCode: string): Promise<CheckInOutResponse> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/check-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ qrCode })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to check out: ${response.status}`);
    }

    const data = await response.json();
    
    // Revalidate relevant paths
    revalidatePath('/attendance');
    revalidatePath(`/students/${data.attendance.studentId}`);
    revalidatePath(`/classes/${data.attendance.classId}`);

    return data;
  } catch (error) {
    console.error("QR check-out error:", error);
    throw error;
  }
};

export const getStudentStatistics = async (
  studentId: number
): Promise<StudentStatistics> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/student/${studentId}/statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch student statistics: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching statistics for student ${studentId}:`, error);
    throw error;
  }
};

export const getClassStatistics = async (
  classId: string
): Promise<ClassStatistics> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/class/${classId}/statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch class statistics: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching statistics for class ${classId}:`, error);
    throw error;
  }
};

export const getMostAttendedDays = async (
  classId: string
): Promise<AttendanceByDay[]> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/class/${classId}/most-attended-days`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch most attended days: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching most attended days for class ${classId}:`, error);
    throw error;
  }
};

export const getAverageAttendancePercentage = async (
  studentId: number
): Promise<number> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/student/${studentId}/average-attendance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch average attendance: ${response.status}`);
    }

    const data = await response.json();
    return data.averageAttendancePercentage;
  } catch (error) {
    console.error(`Error fetching average attendance for student ${studentId}:`, error);
    throw error;
  }
};

export const getMonthlyAttendanceReport = async (
  studentId: number,
  month: number,
  year: number
): Promise<MonthlyReport> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/student/${studentId}/monthly-report/${year}/${month}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch monthly report: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching monthly report for student ${studentId}:`, error);
    throw error;
  }
};

export const getAttendanceTrend = async (
  studentId: number,
  startDate: Date,
  endDate: Date
): Promise<AttendanceTrend> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const startDateParam = startDate.toISOString().split('T')[0];
    const endDateParam = endDate.toISOString().split('T')[0];

    const response = await fetch(
      `${API_URL}/attendance/student/${studentId}/attendance-trend?startDate=${startDateParam}&endDate=${endDateParam}`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance trend: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching attendance trend for student ${studentId}:`, error);
    throw error;
  }
};

export const getClassWiseAttendance = async (
  classId: string
): Promise<ClassWiseAttendance> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/class/${classId}/attendance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch class attendance: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching attendance for class ${classId}:`, error);
    throw error;
  }
};

export const getLateVsOnTimeAttendance = async (
  studentId: number,
  thresholdTime: string = "00:00:00"
): Promise<LateVsOnTimeAttendance> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(
      `${API_URL}/attendance/student/${studentId}/late-vs-ontime?thresholdTime=${encodeURIComponent(thresholdTime)}`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch late vs on-time attendance: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching late vs on-time attendance for student ${studentId}:`, error);
    throw error;
  }
};

export const getWeeklyAttendanceReport = async (
  studentId: number,
  startDate: Date,
  endDate: Date
): Promise<WeeklyReport> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const startDateParam = startDate.toISOString().split('T')[0];
    const endDateParam = endDate.toISOString().split('T')[0];

    const response = await fetch(
      `${API_URL}/attendance/student/${studentId}/weekly-report?startDate=${startDateParam}&endDate=${endDateParam}`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch weekly report: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching weekly report for student ${studentId}:`, error);
    throw error;
  }
};

export const deleteCheckIn = async (
  attendanceId: string
): Promise<{message: string, attendance: Attendance}> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/check-in`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendanceId })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete check-in: ${response.status}`);
    }

    const data = await response.json();
    
    // Revalidate relevant paths
    revalidatePath('/attendance');
    
    return data;
  } catch (error) {
    console.error("Delete check-in error:", error);
    throw error;
  }
};

export const deleteCheckOut = async (
  attendanceId: string
): Promise<{message: string, attendance: Attendance}> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/attendance/check-out`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ attendanceId })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete check-out: ${response.status}`);
    }

    const data = await response.json();
    
    // Revalidate relevant paths
    revalidatePath('/attendance');
    
    return data;
  } catch (error) {
    console.error("Delete check-out error:", error);
    throw error;
  }
};

export const updateAttendance = async (
  attendanceId: string,
  checkInTime?: Date | string | null,
  checkOutTime?: Date | string | null
): Promise<{message: string, attendance: Attendance}> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const updateData: {
      attendanceId: string;
      checkInTime?: Date | string | null;
      checkOutTime?: Date | string | null;
    } = {
      attendanceId
    };

    if (checkInTime !== undefined) updateData.checkInTime = checkInTime;
    if (checkOutTime !== undefined) updateData.checkOutTime = checkOutTime;

    const response = await fetch(`${API_URL}/attendance/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update attendance: ${response.status}`);
    }

    const data = await response.json();
    
    // Revalidate relevant paths
    revalidatePath('/attendance');
    
    return data;
  } catch (error) {
    console.error("Update attendance error:", error);
    throw error;
  }
};