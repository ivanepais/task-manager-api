import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends Tokens {
  user: Omit<UserEntity, 'password' | 'hashedRefreshToken'>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Registra un nuevo usuario y retorna sus datos junto con el Token JWT.
  async register(registerUserDto: RegisterUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(registerUserDto);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  // Autentica credenciales (email y contraseña) y retorna el Token JWT.
  async login(loginUserDto: LoginUserDto): Promise<AuthResponse> {
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
    const tokens = await this.getTokens(user.id, user.email);

    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.usersService.findByIdWithRefreshToken(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Acceso denegado: Sesión no encontrada');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const rtMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!rtMatches) {
      throw new ForbiddenException('Acceso denegado: Refresh Token inválido');
    }

    // Rotación de Tokens: Se expide un par completamente nuevo
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // 4. Logout (Revocación remota)
  async logout(userId: string): Promise<void> {
    await this.usersService.updateHashedRefreshToken(userId, null);
    return { message: 'Sesión cerrada exitosamente' };
  }

  // Helper: Generar par de tokens (AT + RT)
  private async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = { id: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // Helper: Guardar el RT hasheado en la base de datos
  private async updateHashedRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateHashedRefreshToken(userId, hash);
  }
}