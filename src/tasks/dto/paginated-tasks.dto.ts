import { ApiProperty } from '@nestjs/swagger';
import { TaskResponseDto } from './task-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto'; // o la ruta donde lo guardes

export class PaginatedTasksDto {
  @ApiProperty({
    type: () => [TaskResponseDto],
    description: 'Lista de tareas para la página solicitada',
  })
  data: TaskResponseDto[];

  @ApiProperty({
    type: () => PaginationMetaDto,
    description: 'Información de la paginación',
  })
  meta: PaginationMetaDto;
}
