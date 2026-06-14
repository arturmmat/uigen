import { afterEach, describe, expect, test } from "vitest";
import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

afterEach(cleanup);

// Mirrors how main-content.tsx wires up the Preview / Code toggle: a controlled
// Tabs with React state driving which view is shown.
function PreviewCodeToggle() {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");

  return (
    <Tabs
      value={activeView}
      onValueChange={(v) => setActiveView(v as "preview" | "code")}
    >
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">Preview panel</TabsContent>
      <TabsContent value="code">Code panel</TabsContent>
    </Tabs>
  );
}

describe("Preview / Code toggle buttons", () => {
  test("Preview is active by default", () => {
    render(<PreviewCodeToggle />);

    expect(
      screen.getByRole("tab", { name: "Preview" }).getAttribute("data-state")
    ).toBe("active");
    expect(
      screen.getByRole("tab", { name: "Code" }).getAttribute("data-state")
    ).toBe("inactive");
    expect(screen.getByText("Preview panel")).toBeDefined();
  });

  test("clicking Code switches the active tab to Code", async () => {
    const user = userEvent.setup();
    render(<PreviewCodeToggle />);

    await user.click(screen.getByRole("tab", { name: "Code" }));

    expect(
      screen.getByRole("tab", { name: "Code" }).getAttribute("data-state")
    ).toBe("active");
    expect(
      screen.getByRole("tab", { name: "Preview" }).getAttribute("data-state")
    ).toBe("inactive");
    expect(screen.getByText("Code panel")).toBeDefined();
  });

  test("toggling back and forth between Preview and Code works", async () => {
    const user = userEvent.setup();
    render(<PreviewCodeToggle />);

    const previewTab = screen.getByRole("tab", { name: "Preview" });
    const codeTab = screen.getByRole("tab", { name: "Code" });

    await user.click(codeTab);
    expect(codeTab.getAttribute("data-state")).toBe("active");

    await user.click(previewTab);
    expect(previewTab.getAttribute("data-state")).toBe("active");
    expect(codeTab.getAttribute("data-state")).toBe("inactive");

    await user.click(codeTab);
    expect(codeTab.getAttribute("data-state")).toBe("active");
    expect(previewTab.getAttribute("data-state")).toBe("inactive");
  });

  test("clicking the already-active tab keeps it active", async () => {
    const user = userEvent.setup();
    render(<PreviewCodeToggle />);

    const previewTab = screen.getByRole("tab", { name: "Preview" });

    await user.click(previewTab);
    expect(previewTab.getAttribute("data-state")).toBe("active");
  });
});
