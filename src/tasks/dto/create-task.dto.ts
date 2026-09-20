import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsBoolean, IsArray, IsUUID, } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título descriptivo de la tarea',
    example: 'Escribir una función que retorne "Hola Mundo!"',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly title: string;

  @ApiProperty({
    description: 'Descripción detallada de la tarea',
    example: 'Usando una función flecha.',
    maxLength: 500,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly description: string;

  @ApiPropertyOptional({
    description: 'Indica si la tarea se crea en estado completado o pendiente',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'El estado completado debe ser un valor booleano.' })
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Arreglo de UUIDs v4 pertenecientes a las categorías asociadas',
    example: ['8570f87c-1840-48ae-829b-d887a40d00cb'],
    type: [String],
  })
  @IsArray({ message: 'categoryIds debe ser un arreglo de identificadores.' })
  @IsUUID('4', { 
    each: true, 
    message: 'Cada ID de categoría debe ser un UUID v4 válido.',
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
  categoryIds?: string[];
}