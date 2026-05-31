import type {
  AcceptInviteRequest,
  Company,
  LoginRequest,
  User,
} from "@/types/api";

import { api, authApi } from "./client";

export interface SignupBody {
  company_name: string;
  slug: string;
  plan?: string;
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  login: (body: LoginRequest) =>
    authApi.post<{ user: User }>("/login", body),

  signup: (body: SignupBody) =>
    authApi.post<{ user: User; company: Company }>("/signup", body),

  acceptInvite: (body: AcceptInviteRequest) =>
    authApi.post<{ authenticated: boolean; user?: User }>(
      "/accept-invite",
      body,
    ),

  logout: () => authApi.post<{ ok: true }>("/logout"),

  // GET /auth/me goes through the generic proxy.
  me: () => api.get<User>("/auth/me"),
};
