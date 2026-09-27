import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';

import { CategoryEntity } from '../categories/entities/category.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedTasksDto } from './dto/paginated-tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(
    queryDto: PaginationQueryDto,
    userId: string,
  ): Promise<PaginatedTasksDto> {
    const { limit = 10, page = 1, completed, search, categoryId } = queryDto;
    const skip = (page - 1) * limit;

    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.categories', 'category')
      .where('task.userId = :userId', { userId });

    if (completed !== undefined) {
      query.andWhere('task.completed = :completed', { completed });
    }

    if (search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      query.andWhere(
        `EXISTS (
          SELECT 1
          FROM task_categories tc
          WHERE tc.task_id = task.id
            AND tc.category_id = :categoryId
        )`,
        { categoryId },
      );
    }

    const [tasks, total] = await query
      .orderBy('task.createdAt', 'DESC')
      .addOrderBy('task.id', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    const data = tasks.map((task) => this.toResponseDto(task));

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

  async findOne(id: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.findOneEntity(id, userId);

    return this.toResponseDto(task);
  }

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    const { categoryIds, ...taskData } = createTaskDto;
    let categories: CategoryEntity[] = [];

    if (categoryIds && categoryIds.length > 0) {
      categories = await this.categoryRepository.find({
        where: { id: In(categoryIds), userId },
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

    const savedTask = await this.taskRepository.save(newTask);

    return this.toResponseDto(savedTask);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    const { categoryIds, ...taskData } = updateTaskDto;
    const task = await this.findOneEntity(id, userId);

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        const categories = await this.categoryRepository.find({
          where: { id: In(categoryIds), userId },
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
    const savedTask = await this.taskRepository.save(task);
    return this.toResponseDto(savedTask);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.taskRepository.softDelete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }
  }

  async restore(id: string, userId: string): Promise<TaskResponseDto> {
    const result = await this.taskRepository.restore({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`La tarea con ID "${id}" no existe.`);
    }

    const restoredTask = await this.findOneEntity(id, userId);

    return this.toResponseDto(restoredTask);
  }

  private async findOneEntity(id: string, userId: string): Promise<TaskEntity> {
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

  private toResponseDto(task: TaskEntity): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      categories: task.categories.map((category) => ({
        id: category.id,
        name: category.name,
        color: category.color,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
    };
  }
}
