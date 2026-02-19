import { ApiResponse, LoginResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = (await res.json()) as T & ApiResponse;
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    call<ApiResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyEmail: (token: string) =>
    call<ApiResponse>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (body: { email: string; password: string }) =>
    call<ApiResponse>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    call<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: (accessToken: string) =>
    call<ApiResponse>("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),

  logoutAll: (accessToken: string) =>
    call<ApiResponse>("/api/auth/logout-all", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};
