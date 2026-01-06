import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@shared/roles';
import { ROLES_KEY } from './roles.decorator';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { JwtUser } from './types/jwt-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no role restriction → allow
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtUser & { permissions?: string[] } }>();

    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found in token');
    }

    // 🔐 Role check
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission');
    }

    // 🔐 Permission check (only if decorator is used)
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (
        !user.permissions ||
        !requiredPermissions.every((p) => user.permissions!.includes(p))
      ) {
        throw new ForbiddenException(
          'User does not have the required permissions',
        );
      }
    }

    return true;
  }
}
