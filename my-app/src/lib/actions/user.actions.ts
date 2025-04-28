'use server';

import { cookies } from 'next/headers';

const {
  NEXT_PUBLIC_API_URL: API_URL
} = process.env;

export const SignIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    });

    const responseClone = response.clone();

    if (!response.ok) {
      const errorData = await responseClone.json();
      console.error('Error in signin response', errorData);
    }

    const data: AuthResponse = await response.json();

    if (data.token) {
      try {
        const cookieStore = await cookies();
        cookieStore.set('token', data.token, { secure: true, httpOnly: true });
        console.log('Token stored successfully');
      } catch (storeError) {
        console.error('Error storing token:', storeError);
      }
    } else {
      console.error("No token received from the backend");
    }

    return data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

export const SignUp = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
    }

    console.log("Attempting to sign up with API URL:", API_URL);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
      cache: 'no-store'
    });

    console.log("Sign up response status:", response.status);

    const responseClone = response.clone();

    if (!response.ok) {
      try {
        const errorData = await responseClone.json();
        console.error("API error details:", errorData);
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
    }

    const data: AuthResponse = await response.json();

    if (data.token) {
      try {
        const cookieStore = await cookies();
        cookieStore.set('token', data.token, { secure: true, httpOnly: true });
        console.log('Token stored successfully');
      } catch (storeError) {
        console.error('Error storing token:', storeError);
      }
    } else {
      console.error("No token received from the backend");
    }

    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

export const SignOut = async (): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error("Failed to log out");
  }
};

export const GetLoggedInUser = async (): Promise<AuthResponse['user'] | null> => {
  try {
    if (!API_URL) {
      console.error("API URL is not configured");
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      console.log("No authentication token found");
      return null;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.log("Failed to fetch user data");
      return null;
    }

    const userData: AuthResponse = await response.json();
    return userData.user || null;
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    return null;
  }
};

export const ForgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    if (!API_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      cache: 'no-store'
    });

    const responseClone = response.clone();

    if (!response.ok) {
      let errorMessage = "Failed to process password reset request";
      
      try {
        const errorData = await responseClone.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data: ForgotPasswordResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const ResetPassword = async (password: string, token: string): Promise<ResetPasswordResponse> => {
  try {
    if (!API_URL || !password || !token) {
      console.error("Invalid credentials");
    }

    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, token }),
      cache: 'no-store'
    });

    const responseClone = response.clone();

    if (!response.ok) {
      let errorMessage = "Failed to process password reset request";
      
      try {
        const errorData = await responseClone.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      console.error(errorMessage);
    }

    const data: ResetPasswordResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const VerifyEmail = async (email: string, verificationCode: string): Promise<VerifyEmailResponse> => {
  try {
    if (!API_URL) {
      throw new Error("API URL is not configured");
    }

    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code: verificationCode }),
      cache: 'no-store'
    });

    const responseClone = response.clone();

    if (!response.ok) {
      let errorMessage = "Failed to verify email";
      
      try {
        const errorData = await responseClone.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data: VerifyEmailResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
};
