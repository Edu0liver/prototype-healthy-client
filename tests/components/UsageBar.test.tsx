import { render, screen } from "@testing-library/react";

import { UsageBar } from "@/components/feature/UsageBar";

describe("UsageBar", () => {
  it("renders used and quota with a proportional bar", () => {
    const { container } = render(
      <UsageBar label="Mensagens IA" used={42} quota={100} unlimited={false} />,
    );
    expect(screen.getByText("Mensagens IA")).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    // 42% < 80% → brand (not warning/over) color.
    expect(container.querySelector(".bg-brand")).toBeTruthy();
    expect(container.querySelector(".bg-red-500")).toBeNull();
  });

  it("renders an infinite bar for unlimited dimensions", () => {
    render(
      <UsageBar label="Tokens LLM" used={9999} quota={0} unlimited={true} />,
    );
    expect(screen.getByText(/∞/)).toBeInTheDocument();
  });

  it("turns red when usage reaches or exceeds the quota", () => {
    const { container } = render(
      <UsageBar label="Áudio" used={600} quota={600} unlimited={false} />,
    );
    expect(container.querySelector(".bg-red-500")).toBeTruthy();
  });

  it("warns (amber) above 80% of the quota", () => {
    const { container } = render(
      <UsageBar label="Storage" used={90} quota={100} unlimited={false} />,
    );
    expect(container.querySelector(".bg-amber-500")).toBeTruthy();
  });
});
