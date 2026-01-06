import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from 'src/users/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // -----------------------------
  // LOGIN
  // -----------------------------
  async login(dto: LoginDto) {
    const { email, password } = dto;

    // 1️⃣ Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2️⃣ Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3️⃣ FIRST LOGIN → issue TEMP TOKEN ONLY
    if (user.mustChangePassword) {
      const tempPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const tempToken = this.jwtService.sign(tempPayload, {
        secret: this.configService.get<string>('JWT_TEMP_SECRET'), // ✅ IMPORTANT
        expiresIn: '10m',
      });

      return {
        mustChangePassword: true,
        tempToken,
      };
    }

    // 4️⃣ NORMAL LOGIN → access + refresh tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '30m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
      mustChangePassword: false,
    };
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  async logout(userId: string) {
    const user = await this.usersService.findById(userId);

    // If user does not exist, still return success (security best practice)
    if (!user) {
      return { message: 'Logged out successfully' };
    }

    // Clear refresh token ONLY if it exists
    if (user.refreshToken) {
      await this.usersService.updateRefreshToken(userId, null);
    }

    return { message: 'Logged out successfully' };
  }

  // -----------------------------
  // REFRESH ENTRY POINT
  // -----------------------------
  async refresh(refreshToken: string) {
    try {
      // 1️ Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // 2️ Rotate tokens securely
      return this.refreshTokens(payload.sub, refreshToken);
    } catch {
      throw new UnauthorizedException(
        'Refresh token expired or invalid. Please login again',
      );
    }
  }

  // -----------------------------
  // REFRESH TOKENS (ROTATION)
  // -----------------------------
  async refreshTokens(userId: string, refreshToken: string) {
    // 1️ Get user + stored refresh token
    const user = await this.usersService.findByIdWithRefreshToken(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    // 2️ Compare hashed refresh token
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    // 3️ Recreate payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // 4️ New ACCESS TOKEN
    const newAccessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'), // ✅ SAME AS LOGIN
      expiresIn: '30m',
    });

    // 5️ New REFRESH TOKEN (rotation)
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    // 6️ Store new hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // auth.service.ts
  async getProfile(userId: string) {
    return this.usersService.findProfile(userId);
  }
}
