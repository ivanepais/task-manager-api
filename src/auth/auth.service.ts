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
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(registerUserDto);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { email, password } = loginUserDto;

    // Buscar usuario incluyendo el hash de la contraseña
    const user = await this.usersService.findByEmailWithPassword(email);

    // Evitar enumeración de usuarios
    if (!user) {
      this.logger.warn(
        `Intento de login fallido para el email no registrado: ${email}`,
      );
      throw new UnauthorizedException('Credenciales no válidas');
    }

    if (!user.isActive) {
      this.logger.warn(`Intento de login en cuenta inactiva: ${user.id}`);
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    // Comparar la contraseña enviada con el hash guardado
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta para el usuario: ${user.email}`);
      throw new UnauthorizedException('Credenciales no válidas');
    }

    // Eliminar la contraseña del objeto de retorno
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as Partial<typeof user>).password;
    delete (userWithoutPassword as Partial<typeof user>).hashedRefreshToken;

    // Firmar y retornar el token
    const tokens = await this.getTokens(user.id, user.email);

    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokensDto> {
    const user = await this.usersService.findByIdWithRefreshToken(userId);

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Acceso denegado: Sesión no encontrada');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!rtMatches) {
      throw new ForbiddenException('Acceso denegado: Refresh Token inválido');
    }

    // Rotación de Tokens: par nuevo
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateHashedRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

  // Helper: Generar par de tokens (AT + RT)
  private async getTokens(userId: string, email: string): Promise<TokensDto> {
    const jwtPayload: JwtPayload = { id: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn:
          this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
            'JWT_EXPIRES_IN',
          ),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<JwtSignOptions['expiresIn']>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // Helper: Guardar el RT hasheado en la base de datos
  private async updateHashedRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateHashedRefreshToken(userId, hash);
  }
}
