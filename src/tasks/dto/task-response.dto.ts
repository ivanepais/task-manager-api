import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único UUID v7 de la tarea',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Título descriptivo de la tarea',
    example: 'Escribir una función que retorne "Hola Mundo!"',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarea',
    example: 'Usando una función flecha.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Indica si la tarea está completada',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'Fecha y hora de creación de la tarea',
    example: '2026-09-16T12:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización de la tarea',
    example: '2026-09-16T12:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Categorías asociadas a la tarea',
    type: () => [CategoryResponseDto],
  })
  categories?: CategoryResponseDto[];
}
