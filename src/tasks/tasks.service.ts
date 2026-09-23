import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { CategoryEntity } from '../categories/entities/category.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginatedTasksDto } from './dto/paginated-tasks.dto';

@Injectable()
export class TasksService {

  constructor(
    // 1. Inyección del repositorio de TypeORM para la tabla 'tasks'
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // tareas del usuario autenticado con sus categorias 
  async findAll(queryDto: PaginationQueryDto, userId: string,): Promise<PaginatedTasksDto> {
    const { limit = 10, page = 1, completed, search, categoryId } = queryDto;
    const skip = (page - 1) * limit;
      
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.categories', 'category')
      .where('task.userId = :userId', { userId });
    
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
  async findOne(id: string, userId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
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
  async create(createTaskDto: CreateTaskDto, userId: string): Promise<TaskEntity> {
    const { categoryIds, ...taskData } = createTaskDto;
    let categories: CategoryEntity[] = [];
    
    if (categoryIds && categoryIds.length > 0) {
      const uniqueCategoryIds = [...new Set(categoryIds)];

      categories = await this.categoryRepository.find({
        where: { id: In(uniqueCategoryIds), userId },
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException(
          'Una o más categorías especificadas no existen o no te pertenecen.',
        );
      }
    }
    
    const newTask = this.taskRepository.create({
      ...taskData,
      userId,
      categories,
    });

    return await this.taskRepository.save(newTask);
  }

  // Actualiza datos y sincroniza las categorías si se pasan categoryIds
  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string,): Promise<TaskEntity> {
    const { categoryIds, ...taskData } = updateTaskDto;
    const task = await this.findOne(id, userId);

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        
        const uniqueCategoryIds = [...new Set(categoryIds)];

        const categories = await this.categoryRepository.find({
          where: { id: In(uniqueCategoryIds), userId },
        });

        if (categories.length !== categoryIds.length) {
          throw new BadRequestException(
            'Una o más categorías especificadas no existen o no te pertenecen.',
          );
        }
        task.categories = categories;
      } else {
        task.categories = [];
      }
    }

    this.taskRepository.merge(task, taskData);
    return await this.taskRepository.save(task);
  }

  // Elimina la tarea asegurando pertenencia al usuario
  async remove(id: string, userId: string): Promise<void> {
    // Executa un UPDATE directo en SQL sin tocar relaciones ni realizar cascadas innecesarias
    const result = await this.taskRepository.softDelete({ id, userId });

    // Si no afectó ninguna fila, la tarea no existía o no pertenecía a este usuario
    if (result.affected === 0) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }
  }

  // Restaurar una tarea previamente borrada
  async restore(id: string, userId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id, userId },
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