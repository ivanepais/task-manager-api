import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { TaskResponseDto } from './dto/task-response.dto';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { GetUser } from '../auth/decorators/get-user.decorator';

import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedTasksDto } from './dto/paginated-tasks.dto';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las tareas con paginación y filtros dinámicos',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedTasksDto,
    description: 'Lista paginada devuelta exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT no provisto o inválido.',
  })
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @GetUser('id') userId: string,
  ): Promise<PaginatedTasksDto> {
    return await this.tasksService.findAll(paginationQueryDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una tarea por su UUID' })
  @ApiParam({
    name: 'id',
    description: 'UUID v7 de la tarea',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 200,
    type: TaskResponseDto,
    description: 'Tarea encontrada.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Tarea no encontrada o no pertenece al usuario.',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @GetUser('id') userId: string,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({
    status: 201,
    type: TaskResponseDto,
    description: 'Tarea creada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Los datos proporcionados no cumplen las reglas de validación.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser('id') userId: string,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.create(createTaskDto, userId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar una tarea (incluyendo asignación de categorías)',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID v7 de la tarea',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 200,
    type: TaskResponseDto,
    description: 'Tarea actualizada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID v7 válido.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser('id') userId: string,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar lógicamente una tarea (Soft Delete)' })
  @ApiParam({
    name: 'id',
    description: 'UUID v7 de la tarea',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 204,
    description: 'Tarea marcada como eliminada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID v7 válido.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @GetUser('id') userId: string,
  ): Promise<void> {
    await this.tasksService.remove(id, userId);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restaurar una tarea previamente eliminada lógicamente',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID v7 de la tarea borrada',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
  })
  @ApiResponse({
    status: 200,
    type: TaskResponseDto,
    description: 'Tarea restaurada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID v7 válido.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async restore(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @GetUser('id') userId: string,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.restore(id, userId);
  }
}
