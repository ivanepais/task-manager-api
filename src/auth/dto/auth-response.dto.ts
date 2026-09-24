import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class TokensDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso JWT de corta duración',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de refresco JWT de larga duración',
  })
  refreshToken: string;
}

export class AuthResponseDto extends TokensDto {
  @ApiProperty({
    type: () => UserResponseDto,
    description: 'Datos del usuario autenticado',
  })
  user: UserResponseDto;
}
