"use client";

import { useState, useEffect } from "react";
import { login } from "@/services/auth.service";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user } = useAuth();
  const router = useRouter();

  // Redirect after successful login
  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "HR":
        router.replace("/protected/hr/dashboard");
        break;
      case "MENTOR":
        router.replace("/protected/mentor/dashboard");
        break;
      case "INTERN":
        router.replace("/protected/intern/dashboard");
        break;
    }
  }, [user, router]);

  // Login handler
  const handleLogin = async () => {
    try {
      await login(email, password);
      // redirect happens via useEffect when user is set
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
