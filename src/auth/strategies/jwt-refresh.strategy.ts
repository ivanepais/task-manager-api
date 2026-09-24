import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import {
  JwtPayload,
  JwtPayloadWithRt,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // Nos permite acceder al objeto Request en validate()
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    console.log(
      '===> 2. JWT Refresh Strategy invocada para usuario:',
      payload.id,
    );
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new UnauthorizedException('Refresh Token no proporcionado');
    }

    const refreshToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    return {
      ...payload,
      refreshToken,
    };
  }
}
