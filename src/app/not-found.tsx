import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Studio OS",
};

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ background: "#06060f", color: "#f0f0ff", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "4rem", marginBottom: "8px" }}>404</h1>
          <p style={{ opacity: 0.5 }}>Page not found</p>
        </div>
      </body>
    </html>
  );
}
