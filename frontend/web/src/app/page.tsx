"use client";

import { useAuth } from "@/context/auth.context";

export default function HomePage() {
  const auth = useAuth();

  if (!auth) return null; // context not ready

  const { user, loading } = auth;

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
