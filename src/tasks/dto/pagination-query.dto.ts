import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsBoolean, IsString, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 10, description: 'Cantidad de elementos por página', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Filtrar por tareas completadas (true) o pendientes (false)', example: false })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ description: 'Búsqueda por coincidencia en título o descripción', example: 'Backend' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'UUID v4 de la categoría asociada', example: '8570f87c-1840-48ae-829b-d887a40d00cb' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;
}