import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import LoginPage from "@/app/(auth)/login/page";
import { server } from "../mocks/server";
import { renderWithProviders } from "../utils/renderWithProviders";

// next/navigation has no real router in jsdom — mock the hooks the page uses.
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => "/login",
}));

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("voce@empresa.com"), "admin@acme.com");
  await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
  await user.click(screen.getByRole("button", { name: /entrar/i }));
}

describe("Login page", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    // Keep location at /login so the client's 401 guard never tries to navigate.
    window.history.pushState({}, "", "/login");
  });

  it("renders the login form", () => {
    renderWithProviders(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: /entrar/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("voce@empresa.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("success: logs in and redirects to the dashboard", async () => {
    // Base handler already returns 200 { user } for POST /api/auth/login.
    renderWithProviders(<LoginPage />);
    await fillAndSubmit();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/dashboard"));
  });

  it("error: shows the backend error message on invalid credentials", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json(
          {
            error: "Unauthorized",
            message: "invalid credentials",
            code: "unauthorized",
          },
          { status: 401 },
        ),
      ),
    );

    renderWithProviders(<LoginPage />);
    await fillAndSubmit();

    // Toast surfaces the backend message; no navigation happens.
    expect(await screen.findByText("invalid credentials")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
