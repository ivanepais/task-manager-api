import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

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
    await this.hashAndStoreRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { email, password } = loginUserDto;

    const user = await this.usersService.findByEmailWithPassword(email);

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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Contraseña incorrecta para el usuario: ${user.email}`);
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const userResponse = this.toUserResponseDto(user);

    const tokens = await this.getTokens(user.id, user.email);

    await this.hashAndStoreRefreshToken(user.id, tokens.refreshToken);

    return {
      user: userResponse,
      ...tokens,
    };
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokensDto> {
    const user = await this.usersService.findByIdWithRefreshTokenOrNull(userId);

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

    const tokens = await this.getTokens(user.id, user.email);
    await this.hashAndStoreRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateHashedRefreshToken(userId, null);
  }

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

  private async hashAndStoreRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateHashedRefreshToken(userId, hash);
  }

  private toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      createdAt: user.createdAt,
    };
  }
}
