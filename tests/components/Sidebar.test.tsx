import { render, screen } from "@testing-library/react";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/auth/AuthContext";
import type { User } from "@/types/api";

// Sidebar depends on the auth state and the current path. Mock both so the test
// focuses on the role-based rendering logic (RF-USR-02).
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("@/lib/auth/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function setUser(role: User["role"]) {
  mockedUseAuth.mockReturnValue({
    user: { id: "1", email: "u@a.com", name: "U", role, status: "active" },
    loading: false,
    isRole: (...r) => r.includes(role),
    logout: jest.fn(),
    refresh: jest.fn(),
  });
}

describe("Sidebar", () => {
  afterEach(() => jest.clearAllMocks());

  it("renders the brand and every nav item for an admin", () => {
    setUser("admin");
    render(<Sidebar />);

    expect(screen.getByText("Lumia")).toBeInTheDocument();
    for (const label of [
      "Visão geral",
      "Conversas",
      "Canais",
      "Agentes",
      "Conhecimento",
      "Automações",
      "Definições",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("hides admin-only entries for an operator", () => {
    setUser("operator");
    render(<Sidebar />);

    // Allowed for operator.
    expect(screen.getByText("Visão geral")).toBeInTheDocument();
    expect(screen.getByText("Conversas")).toBeInTheDocument();

    // Admin-only — must not render.
    expect(screen.queryByText("Canais")).not.toBeInTheDocument();
    expect(screen.queryByText("Agentes")).not.toBeInTheDocument();
    expect(screen.queryByText("Definições")).not.toBeInTheDocument();
  });

  it("links the active item to its route", () => {
    setUser("admin");
    render(<Sidebar />);

    const overview = screen.getByText("Visão geral").closest("a");
    expect(overview).toHaveAttribute("href", "/");
  });
});
