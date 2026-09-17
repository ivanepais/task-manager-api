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
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

import { PaginationQueryDto } from './dto/pagination-query.dto';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas con paginación y filtros dinámicos' })
  @ApiResponse({ status: 200, description: 'Lista paginada devuelta exitosamente.' })
  @ApiResponse({ status: 401, description: 'Token JWT no provisto o inválido.' })
  findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.findAll(paginationQueryDto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una tarea por su UUID' })
  @ApiParam({ name: 'id', description: 'UUID v4 de la tarea', example: '7f61495f-64c8-42ad-aea8-6b6603984c70' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada o no pertenece al usuario.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User,): Promise<TaskEntity> {
    return await this.tasksService.findOne(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User,): Promise<TaskEntity> {
    return await this.tasksService.create(createTaskDto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una tarea (incluyendo asignación de categorías)' })
  @ApiParam({ name: 'id', description: 'UUID v4 de la tarea', example: '7f61495f-64c8-42ad-aea8-6b6603984c70' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto, @GetUser() user: User,
  ): Promise<TaskEntity> {
    return await this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar lógicamente una tarea (Soft Delete)' })
  @ApiParam({ name: 'id', description: 'UUID v4 de la tarea', example: '7f61495f-64c8-42ad-aea8-6b6603984c70' })
  @ApiResponse({ status: 204, description: 'Tarea marcada como eliminada correctamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User,): Promise<void> {
    await this.tasksService.remove(id, user);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar una tarea previamente eliminada lógicamente' })
  @ApiParam({ name: 'id', description: 'UUID v4 de la tarea borrada', example: '7f61495f-64c8-42ad-aea8-6b6603984c70' })
  @ApiResponse({ status: 200, description: 'Tarea restaurada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.tasksService.restore(id, user);
  }
}