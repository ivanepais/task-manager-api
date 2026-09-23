import { ApiProperty } from '@nestjs/swagger';
import { TaskEntity } from '../entities/task.entity';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto'; // o la ruta donde lo guardes

export class PaginatedTasksDto {
  @ApiProperty({
    type: [TaskEntity],
    description: 'Lista de tareas para la página solicitada',
  })
  data: TaskEntity[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Información de la paginación',
  })
  meta: PaginationMetaDto;
}