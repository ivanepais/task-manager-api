import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description: 'Crea una cuenta de usuario proporcionando un correo único, nombre completo y una contraseña segura.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada no válidos (fallo en validaciones de class-validator).',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya se encuentra registrado.',
  })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambia el código por defecto de POST (201) a 200 OK para el login
  @ApiOperation({
    summary: 'Iniciar sesión de usuario',
    description: 'Autentica a un usuario existente mediante sus credenciales y devuelve un token de acceso JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso. Retorna el token JWT y la información del usuario.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada no válidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas (correo electrónico o contraseña incorrectos).',
  })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}