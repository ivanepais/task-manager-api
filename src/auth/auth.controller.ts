import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from '../users/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambia el código por defecto de POST (201) a 200 OK para el login
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}