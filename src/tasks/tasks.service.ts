/*
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from './task.model'; // Modelo interno
import { CreateTaskDto } from './dto/create-task.dto'; // DTO para creación
import { UpdateTaskDto } from './dto/update-task.dto'; // DTO para actualización
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  constructor(private readonly configService: ConfigService) {
    // Lectura de variables con tipos de datos
    const env = this.configService.get<string>('ENVIRONMENT');
    const port = this.configService.get<number>('PORT');
    
    console.log(`Ejecutando en modo ${env} en el puerto ${port}`);
  }

  private tasks: Task[] = []; // Sigue usando la interfaz Task

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }
    return task;
  }

  // Recibe el DTO y construye la entidad Task completa
  create(createTaskDto: CreateTaskDto): Task {
    const newTask: Task = {
      id: Date.now().toString(),
      ...createTaskDto, // Copia title y description
      completed: false, // Regla de negocio: nace incompleta
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // Recibe el DTO de actualización
  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    Object.assign(task, updateTaskDto); // Aplica solo los campos enviados
    return task;
  }

  remove(id: string): void {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }
    this.tasks.splice(index, 1);
  }
}
*/


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async findAll(): Promise<TaskEntity[]> {
    return await this.taskRepository.find();
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    // 1. Crea la instancia de la entidad respetando las reglas de clase
    const newTask = this.taskRepository.create(createTaskDto);
    // 2. Persiste la entidad en PostgreSQL (ejecuta INSERT)
    return await this.taskRepository.save(newTask);
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }
  }
}