import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '018f3a9e-1a2b-7c3d-8e4f-5a6b7c8d9e0f' })
  id: string;

  @ApiProperty({ example: 'pepe@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Pepe' })
  userName: string;

  @ApiProperty({ example: '2026-03-30T10:00:00.000Z' })
  createdAt: Date;
}
