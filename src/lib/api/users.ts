import type { InviteRequest, User, UsersList } from "@/types/api";

import { api } from "./client";

export const userService = {
  list: () => api.get<UsersList>("/users").then((r) => r.users),
  invite: (body: InviteRequest) => api.post<User>("/users", body),
};
