import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtUser } from './types/jwt-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // -----------------------------
  // LOGIN
  // -----------------------------
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // -----------------------------
  // PROFILE (PROTECTED)
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request & { user: JwtUser }) {
    // req.user is GUARANTEED here
    return this.authService.getProfile(req.user.sub);
  }

  // -----------------------------
  // LOGOUT (PROTECTED)
  // Clears cookie + DB refresh token
  // -----------------------------
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    return this.authService.logout(req.user.sub);
  }

  // -----------------------------
  // REFRESH TOKEN
  // -----------------------------
  @Post('refresh')
  refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    return this.authService.refresh(refreshToken);
  }
}
