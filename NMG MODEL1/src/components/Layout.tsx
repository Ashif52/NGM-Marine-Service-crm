import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b0f1a", color: "#fff" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 32px",
          borderBottom: "1px solid #222",
        }}
      >
        <img src="/nmg-logo.jpeg" alt="NMG Marine" style={{ height: 48 }} />
        <h2 style={{ margin: 0 }}>NMG Marine</h2>
      </header>

      {/* Page */}
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  );
}
