import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador único UUID v7 del usuario',
    example: '018f3a9e-1a2b-7c3d-8e4f-5a6b7c8d9e0f',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'pepe@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre de usuario público',
    example: 'Pepe',
  })
  userName: string;

  @ApiProperty({
    description: 'Fecha y hora de creación de la cuenta',
    example: '2026-03-30T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
