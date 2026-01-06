/**
 * roleRedirect.ts
 * ----------------
 * Maps user roles to their dashboard routes
 */

export function getDashboardRoute(role: string) {
  switch (role) {
    case "HR":
      return "/protected/hr/dashboard";
    case "MENTOR":
      return "/protected/mentor/dashboard";
    case "INTERN":
      return "/protected/intern/dashboard";
    default:
      return "/login";
  }
}
