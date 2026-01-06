"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚫 Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <button
        onClick={() => router.push("/login")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "5px",
          background: "blue",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Go to Login
      </button>
    </div>
  );
}
