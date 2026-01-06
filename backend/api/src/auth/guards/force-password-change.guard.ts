import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ForcePasswordChangeGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If user is not logged in, let other guards handle it
    if (!user) return true;

    // Allow access if user does NOT need to change password
    if (!user.mustChangePassword) return true;

    // Allow only the change-password endpoint
    const allowedPaths = ['/users/change-password'];
    if (allowedPaths.includes(request.url) && request.method === 'PATCH') {
      return true;
    }

    // Block all other routes
    throw new BadRequestException(
      'You must change your password before accessing the system.',
    );
  }
}
