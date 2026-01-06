import { SetMetadata } from '@nestjs/common';

// Key for Reflect metadata
export const PERMISSIONS_KEY = 'permissions';

// Decorator to attach permissions to route handlers
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
