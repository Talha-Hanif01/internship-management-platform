import RoleGuard from "@/components/auth/RoleGuard";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={["MENTOR"]}>{children}</RoleGuard>;
}
