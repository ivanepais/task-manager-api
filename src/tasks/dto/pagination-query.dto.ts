import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    default: 10,
    description: 'Cantidad de elementos por página',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    default: 1,
    description: 'Número de página',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Filtrar por tareas completadas (true) o pendientes (false)',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'El parámetro completed debe ser un valor booleano.' })
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda por coincidencia en título o descripción',
    example: 'Function',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({
    description: 'UUID v7 de la categoría asociada',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID('7')
  categoryId?: string;
}
