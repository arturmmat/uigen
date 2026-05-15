import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolCallBadge, getLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

// --- getLabel unit tests ---

describe("getLabel", () => {
  describe("str_replace_editor", () => {
    it("returns creating label with filename for create command", () => {
      expect(getLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating App.jsx");
    });

    it("returns editing label for str_replace command", () => {
      expect(getLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" })).toBe("Editing Button.tsx");
    });

    it("returns editing label for insert command", () => {
      expect(getLabel("str_replace_editor", { command: "insert", path: "/lib/utils.ts" })).toBe("Editing utils.ts");
    });

    it("returns reading label for view command", () => {
      expect(getLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading App.jsx");
    });

    it("falls back gracefully when path is missing", () => {
      expect(getLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
    });
  });

  describe("file_manager", () => {
    it("returns renaming label with both filenames", () => {
      expect(getLabel("file_manager", { command: "rename", path: "/old.tsx", new_path: "/new.tsx" })).toBe("Renaming old.tsx to new.tsx");
    });

    it("returns deleting label with filename", () => {
      expect(getLabel("file_manager", { command: "delete", path: "/components/Card.tsx" })).toBe("Deleting Card.tsx");
    });

    it("falls back gracefully when paths are missing", () => {
      expect(getLabel("file_manager", { command: "rename" })).toBe("Renaming file");
    });
  });

  it("falls back to tool name for unknown tools", () => {
    expect(getLabel("unknown_tool", {})).toBe("unknown_tool");
  });
});

// --- ToolCallBadge rendering tests ---

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "call"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "1", toolName, args, state, result: "ok" } as ToolInvocation;
  }
  return { toolCallId: "1", toolName, args, state } as ToolInvocation;
}

describe("ToolCallBadge", () => {
  it("shows friendly label for create command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" })}
      />
    );
    expect(screen.getByText("Creating App.jsx")).toBeDefined();
  });

  it("shows friendly label for str_replace command", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "/components/Card.tsx" })}
      />
    );
    expect(screen.getByText("Editing Card.tsx")).toBeDefined();
  });

  it("shows spinner when tool call is in progress", () => {
    const { container } = render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "call")}
      />
    );
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows green dot when tool call is complete", () => {
    const { container } = render(
      <ToolCallBadge
        toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")}
      />
    );
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
    expect(container.querySelector(".animate-spin")).toBeFalsy();
  });

  it("shows friendly label for file_manager delete", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("file_manager", { command: "delete", path: "/utils.ts" })}
      />
    );
    expect(screen.getByText("Deleting utils.ts")).toBeDefined();
  });

  it("shows friendly label for file_manager rename", () => {
    render(
      <ToolCallBadge
        toolInvocation={makeInvocation("file_manager", { command: "rename", path: "/old.tsx", new_path: "/new.tsx" })}
      />
    );
    expect(screen.getByText("Renaming old.tsx to new.tsx")).toBeDefined();
  });
});
