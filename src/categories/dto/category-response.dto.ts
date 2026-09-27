import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Identificador único UUID v7 de la categoría',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre asignado a la categoría',
    example: 'Work',
  })
  name: string;

  @ApiProperty({
    description: 'Código hexadecimal del color de la categoría',
    example: '#4A90E2',
  })
  color: string;

  @ApiProperty({
    description: 'Fecha y hora de creación de la categoría',
    example: '2026-09-15T19:02:10.149Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización de la categoría',
    example: '2026-09-15T19:10:22.149Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
