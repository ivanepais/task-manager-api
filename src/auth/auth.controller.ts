import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { GetUser } from './decorators/get-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea una cuenta de usuario proporcionando un correo único, nombre completo y una contraseña segura.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada no válidos (fallo en validaciones de class-validator).',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya se encuentra registrado.',
  })
  register(@Body() registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambia el código por defecto de POST (201) a 200 OK para el login
  @ApiOperation({
    summary: 'Iniciar sesión de usuario',
    description:
      'Autentica a un usuario existente mediante sus credenciales y devuelve un token de acceso JWT.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Inicio de sesión exitoso. Retorna el token JWT y la información del usuario.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada no válidos.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Credenciales inválidas (correo electrónico o contraseña incorrectos).',
  })
  login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.authService.login(loginUserDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('refresh-token')
  @ApiOperation({
    summary: 'Renovar tokens de acceso',
    description:
      'Recibe un Refresh Token válido en las cabeceras Bearer, lo valida contra BD y devuelve un nuevo par de tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente.',
    type: TokensDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Refresh Token inválido o expirado.',
  })
  refreshTokens(
    @GetUser('id') userId: string,
    @GetUser('refreshToken') refreshToken: string,
  ): Promise<TokensDto> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cerrar sesión de usuario y revocar Refresh Token' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  logout(@GetUser('id') userId: string): Promise<void> {
    return this.authService.logout(userId);
  }
}
