import { IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@shared/roles';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
