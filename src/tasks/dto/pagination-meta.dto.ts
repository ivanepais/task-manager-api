import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 45, description: 'Total de registros encontrados' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Cantidad de elementos por página' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total de páginas disponibles' })
  totalPages: number;
}