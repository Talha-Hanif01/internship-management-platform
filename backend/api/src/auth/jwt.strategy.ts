import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtUser } from './types/jwt-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      // MUST MATCH AuthModule secret
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtUser) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
