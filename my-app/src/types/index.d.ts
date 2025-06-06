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

declare type CardParamProps = {
  params: {
    studentId: string;
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

declare type CreateQrCodeResponse = {
  studentId: string;
};

declare type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  classId: string;
  parentId: number;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  parent?: Parent;
};

declare interface QRCodeData {
  id: string;
  code: string;
  url: string;
  studentId: string;
}

declare interface CreateQrCodeResponse {
  message: string;
  qrCode: QRCodeData;
}

declare interface GetQrCodeResponse {
  qrCode: string;
  url: string;
}