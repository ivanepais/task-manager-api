import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { User } from '../users/entities/user.entity';

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

  // tareas del usuario autenticado
  async findAll(user: User): Promise<TaskEntity[]> {
    return await this.taskRepository.find({
      where: { user: { id: user.id } },
    });
  }

  // Busca una tarea por ID filtrando que pertenezca al usuario
  async findOne(id: string, user: User): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!task) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }
    return task;
  }

  // Asigna la relación del usuario a la nueva tarea
  async create(createTaskDto: CreateTaskDto, user: User): Promise<TaskEntity> {
    const newTask = this.taskRepository.create({
      ...createTaskDto,
      user, // Asigna el objeto User completo a la tarea
    });
    await this.taskRepository.save(newTask);
    delete (newTask as Partial<TaskEntity>).user;
    return newTask;
  }

  // Actualiza la tarea validando primero la propiedad mediante findOne
  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<TaskEntity> {
    const task = await this.findOne(id, user); // Reutiliza findOne para lanzar 404 si no existe
    const updatedTask = this.taskRepository.merge(task, updateTaskDto);
    return await this.taskRepository.save(updatedTask); // Si la entidad ya tiene 'id', save() realiza UPDATE
  }

  // Elimina la tarea asegurando pertenencia al usuario
  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user); // Valida
    await this.taskRepository.remove(task);
  }
}