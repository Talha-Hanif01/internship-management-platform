import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtUser } from './types/jwt-user.interface';

@Injectable()
export class JwtTempStrategy extends PassportStrategy(Strategy, 'jwt-temp') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_TEMP_SECRET'),
    });
  }

  validate(payload: JwtUser) {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
