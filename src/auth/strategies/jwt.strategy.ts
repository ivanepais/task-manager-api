import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  /**
   * Método que Passport ejecuta automáticamente tras verificar la firma y expiración del token.
   * Lo que retorne este método se adjuntará automáticamente a req.user en cada petición.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new UnauthorizedException('Token no válido: usuario no existe');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo, contacte al administrador');
    }

    return user;
  }
}