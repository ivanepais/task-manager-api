import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    // 1. Inyección del repositorio de TypeORM para la tabla 'tasks'
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    
    // 2. Mantenemos ConfigService si necesitas leer variables de entorno en el servicio
    private readonly configService: ConfigService,
  ) {
    const env = this.configService.get<string>('ENVIRONMENT');
    console.log(`TasksService inicializado en entorno: ${env}`);
  }

  // Obtenemos todas las tareas desde PostgreSQL
  async findAll(): Promise<TaskEntity[]> {
    return await this.taskRepository.find();
  }

  // Buscamos una tarea por ID (UUID en PostgreSQL)
  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }
    return task;
  }

  // Creamos la instancia en memoria y la persistimos con INSERT
  async create(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const newTask = this.taskRepository.create(createTaskDto);
    return await this.taskRepository.save(newTask);
  }

  // Buscamos la tarea, aplicamos los cambios del DTO y ejecutamos UPDATE
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(id); // Reutiliza findOne para lanzar 404 si no existe
    Object.assign(task, updateTaskDto);   // Aplica solo los campos enviados en el DTO
    return await this.taskRepository.save(task); // Si la entidad ya tiene 'id', save() realiza UPDATE
  }

  // Eliminamos directamente por ID y verificamos el número de filas afectadas
  async remove(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }
  }
}