"use client";

import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  allowedRoles: ("HR" | "MENTOR" | "INTERN")[];
  children: React.ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) return null;
  if (!user) return null;

  return <>{children}</>;
}
