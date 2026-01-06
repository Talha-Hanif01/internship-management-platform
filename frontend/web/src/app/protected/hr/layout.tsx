import RoleGuard from "@/components/auth/RoleGuard";

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["HR"]}>{children}</RoleGuard>;
}
