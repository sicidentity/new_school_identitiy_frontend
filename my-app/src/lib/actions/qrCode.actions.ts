'use server';

import { cookies } from 'next/headers';

const {
  NEXT_PUBLIC_API_URL: API_URL
} = process.env;

export async function generateQRCode(studentId: string): Promise<CreateQrCodeResponse> {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error("API URL is not configured");
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/qrCodes/students/qrcode`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentId }),
      cache: 'no-store'
    });

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      let errorMessage = "Failed to generate QR Code";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData?.message || errorMessage;
      } catch (parseError) {
        errorMessage = responseText || errorMessage;
        console.error("Could not parse error response:", parseError);
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    let responseData: CreateQrCodeResponse;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!responseData.qrCode || !responseData.qrCode.url) {
      throw new Error("Invalid response structure: missing QR code data");
    }
    
    return responseData;
  } catch (err) {
    console.error('Error generating QR Code:', err);
    throw err;
  }
}

export const getQrCode = async (studentId: string): Promise<QRCodeData> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      throw new Error('API URL is not configured');
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/qrCodes/students/${studentId}/qrcode`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorMessage = "Failed to fetch QR Code";
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData?.message || errorMessage;
      } catch (parseError) {
        errorMessage = responseText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const responseData: GetQrCodeResponse = await response.json();
    console.log('Fetching QR code data:', responseData);

    if (!responseData.qrCode) {
      throw new Error("QR Code string is missing in the response");
    }

    return {
      id: '',
      code: responseData.qrCode,
      url: responseData.url || '',
      studentId: studentId
    };
  } catch (err) {
    console.error('Error fetching QR Code:', err);
    throw err;
  }
}

export const checkQRCodeExists = async (studentId: string): Promise<boolean> => {
  try {
    await getQrCode(studentId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return false;
    }
    throw error;
  }
}

export const getOrGenerateQRCode = async (studentId: string): Promise<QRCodeData> => {
  try {
    return await getQrCode(studentId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      console.log('QR code not found, generating new one...');
      const response = await generateQRCode(studentId);
      return response.qrCode;
    }
    throw error;
  }
}