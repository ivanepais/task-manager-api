import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { User } from '../users/entities/user.entity';
import { CategoryEntity } from '../categories/entities/category.entity';

import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class TasksService {
  constructor(
    // 1. Inyección del repositorio de TypeORM para la tabla 'tasks'
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    // 2. Mantenemos ConfigService si necesitas leer variables de entorno en el servicio
    private readonly configService: ConfigService,
  ) {
    const env = this.configService.get<string>('ENVIRONMENT');
    console.log(`TasksService inicializado en entorno: ${env}`);
  }

  // tareas del usuario autenticado con sus categorias 
  async findAll(queryDto: PaginationQueryDto, user: User): Promise<PaginatedResponse<TaskEntity>> {
    const { limit = 10, page = 1, completed, search, categoryId } = queryDto;
    const skip = (page - 1) * limit;
      
    const query = this.taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.categories', 'category')
      .where('task.userId = :userId', { userId: user.id });
    
    // Filtro por estado completed
    if (completed !== undefined) {
      query.andWhere('task.completed = :completed', { completed });
    }

    // Búsqueda insensible a mayúsculas en título o descripción
    if (search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtro por categoría asociada
    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    }

    const [data, total] = await query
      .orderBy('task.createdAt', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Busca una tarea por ID filtrando que pertenezca al usuario
  async findOne(id: string, user: User): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: {
        categories: true,
      },
    });
    if (!task) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }
    return task;
  }

  // Crea la tarea y asocia las categorías que pertenecen al usuario
  async create(createTaskDto: CreateTaskDto, user: User): Promise<TaskEntity> {
    const { categoryIds, ...taskData } = createTaskDto;
    let categories: CategoryEntity[] = [];
    
    if (categoryIds && categoryIds.length > 0) {
      categories = await this.categoryRepository.find({
        where: { id: In(categoryIds), user: { id: user.id } },
      });
    }
    
    const newTask = this.taskRepository.create({
      ...taskData,
      user,
      categories,
    });
    await this.taskRepository.save(newTask);
    delete (newTask as Partial<TaskEntity>).user;
    return newTask;
  }

  // Actualiza datos y sincroniza las categorías si se pasan categoryIds
  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<TaskEntity> {
    const { categoryIds, ...taskData } = updateTaskDto;
    const task = await this.findOne(id, user);

    if (categoryIds !== undefined) {
      task.categories = categoryIds.length > 0
        ? await this.categoryRepository.find({
            where: { id: In(categoryIds), user: { id: user.id } },
          })
        : [];
    }

    this.taskRepository.merge(task, taskData);
    return await this.taskRepository.save(task);
  }

  // Elimina la tarea asegurando pertenencia al usuario
  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);
    await this.taskRepository.softRemove(task);
  }

  // Restaurar una tarea previamente borrada
  async restore(id: string, user: User): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: user.id } },
      withDeleted: true, // Permite encontrar registros con deletedAt !== null
      relations: { categories: true },
    });

    if (!task) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }

    if (!task.deletedAt) {
      return task; // Ya estaba activa
    }

    return await this.taskRepository.recover(task);
  }
}