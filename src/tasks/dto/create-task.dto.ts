import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres.' })
  readonly title: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres.' })
  readonly description: string;
}