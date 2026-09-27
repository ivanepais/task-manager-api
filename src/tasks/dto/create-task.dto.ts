import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  ArrayUnique,
  ArrayMaxSize,
} from 'class-validator';
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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarea',
    example: 'Usando una función flecha.',
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: 'La descripción debe ser una cadena de texto.',
  })
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly description?: string | null;

  @ApiPropertyOptional({
    description: 'Indica si la tarea se crea en estado completado o pendiente',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'El estado completado debe ser un valor booleano.' })
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({
    description:
      'Arreglo de UUIDs v7 pertenecientes a las categorías asociadas',
    example: ['018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b'],
    type: [String],
  })
  @IsArray({ message: 'categoryIds debe ser un arreglo de identificadores.' })
  @IsUUID('7', {
    each: true,
    message: 'Cada ID de categoría debe ser un UUID v7 válido.',
  })
  @IsOptional()
  @ArrayUnique({
    message: 'categoryIds no debe contener identificadores duplicados.',
  })
  @ArrayMaxSize(15, {
    message: 'No se pueden asociar más de 15 categorías a una tarea.',
  })
  categoryIds?: string[];
}
