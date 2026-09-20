import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Registra un nuevo usuario y retorna sus datos junto con el Token JWT.
  async register(registerUserDto: RegisterUserDto) {
    const user = await this.usersService.create(registerUserDto);
    const token = await this.getJwtToken({ id: user.id, email: user.email });

    return { user, token };
  }

  // Autentica credenciales (email y contraseña) y retorna el Token JWT.
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // 1. Buscar usuario incluyendo el hash de la contraseña
    const user = await this.usersService.findByEmailWithPassword(email);

    // Mensaje unificado para evitar enumeración de usuarios
    if (!user) {
      this.logger.warn(`Intento de login fallido para el email no registrado: ${email}`);
      throw new UnauthorizedException('Credenciales no válidas');
    }

    if (!user.isActive) {
      this.logger.warn(`Intento de login en cuenta inactiva: ${user.id}`);
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    // 2. Comparar la contraseña enviada con el hash guardado
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta para el usuario: ${user.email}`);
      throw new UnauthorizedException('Credenciales no válidas');
    }

    // 3. Eliminar la contraseña del objeto de retorno
    const { password: _, ...userWithoutPassword } = user;

    // 4. Firmar y retornar el token
    const token = await this.getJwtToken({ id: user.id, email: user.email });

    return {
      user: userWithoutPassword,
      token,
    };
  }

  // Genera y firma un token JWT asíncronamente.
  private async getJwtToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}