import { UserRole } from '@shared/roles';

export interface JwtUser {
  sub: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}
