import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@shared/roles';

/**
 * ROLES_KEY
 * Used as a unique key to store roles metadata on routes
 */
export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * ----------------
 * Attaches allowed roles to a route handler
 * This metadata is later read by RolesGuard
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
