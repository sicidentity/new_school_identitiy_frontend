declare interface AuthResponse {
  token?: string;
  user?: {
    name: string;
    email: string;
  };
  message?: string;
}

declare interface ForgotPasswordResponse {
  message: string;
}

declare interface ResetPasswordResponse {
  message: string;
}

declare type LoggedInContextType = {
  isLoggedIn: boolean;
};

declare type ParamProps = {
  params: {
    token: string;
  };
};

declare type VerifyEmailResponse = {
  success: boolean;
  message: string;
};

declare type UserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

declare type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};