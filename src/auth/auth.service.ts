import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario y retorna sus datos junto con el Token JWT.
   */
  async register(registerUserDto: RegisterUserDto) {
    const user = await this.usersService.create(registerUserDto);

    return {
      user,
      token: this.getJwtToken({ id: user.id, email: user.email }),
    };
  }

  /**
   * Autentica credenciales (email y contraseña) y retorna el Token JWT.
   */
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // 1. Buscar usuario incluyendo el hash de la contraseña
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales no válidas (email)');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    // 2. Comparar la contraseña enviada con el hash guardado en PostgreSQL
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales no válidas (password)');
    }

    // 3. Eliminar la contraseña del objeto de retorno por seguridad
    const { password: _, ...userWithoutPassword } = user;

    // 4. Retornar el usuario junto con su token firmado
    return {
      user: userWithoutPassword,
      token: this.getJwtToken({ id: user.id, email: user.email }),
    };
  }

  /**
   * Genera y firma un token JWT asíncronamente con el payload especificado.
   */
  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}