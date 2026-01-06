import RoleGuard from "@/components/auth/RoleGuard";

export default function InternLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={["INTERN"]}>{children}</RoleGuard>;
}
