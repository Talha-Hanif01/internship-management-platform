import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@shared/roles';

// Key used internally by Nest
export const ROLES_KEY = 'roles';

// Usage: @Roles(UserRole.HR)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
