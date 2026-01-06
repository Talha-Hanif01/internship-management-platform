// Import required NestJS decorators and interfaces
import {
  Injectable, // Marks this class as injectable (DI enabled)
  CanActivate, // Interface that all guards must implement
  ExecutionContext, // Provides details about the current request
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

// Import the metadata key used by @Permissions decorator
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  // Reflector is injected automatically by NestJS
  // It allows us to read custom metadata added via decorators
  constructor(private reflector: Reflector) {}

  /**
   * This method runs BEFORE the controller route is executed
   * If it returns TRUE → request continues
   * If it returns FALSE → NestJS throws 403 Forbidden
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * Get permissions required by the route
     * It checks:
     * 1️ Method-level metadata
     * 2 Controller-level metadata
     *
     * Example:
     * @Permissions('CREATE_INTERN')
     */
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [
        context.getHandler(), // method (route)
        context.getClass(), // controller
      ],
    );

    /**
     * If no permissions are required for this route,
     * allow the request to continue
     */
    if (!requiredPermissions) {
      return true;
    }

    /**
     * Extract authenticated user from request
     * (Added by JwtStrategy → req.user)
     */
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    /**
     * Check if user has ALL required permissions
     *
     * Example:
     * requiredPermissions = ['CREATE_INTERN']
     * user.permissions = ['CREATE_INTERN', 'VIEW_INTERN']
     */
    return requiredPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );
  }
}
