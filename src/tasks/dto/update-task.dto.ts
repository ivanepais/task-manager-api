import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres.' })
  readonly title?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres.' })
  readonly description?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado completed debe ser un valor booleano.' })
  readonly completed?: boolean;
}