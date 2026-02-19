export type ApiResponse = {
  success?: boolean;
  status?: boolean;
  message: string;
};

export type UserInfo = {
  id: string;
  name: string;
  email: string;
};

export type LoginResponse = ApiResponse & {
  accessToken: string;
  sessionId: string;
  user: UserInfo;
};

export type AuthState = {
  accessToken: string;
  sessionId: string;
  user: UserInfo;
};
