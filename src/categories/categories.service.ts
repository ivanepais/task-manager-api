import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(userId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return categories.map((category) => this.toResponseDto(category));
  }

  async findOne(id: string, userId: string): Promise<CategoryResponseDto> {
    const category = await this.findOneEntity(id, userId);

    return this.toResponseDto(category);
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<CategoryResponseDto> {
    try {
      const category = this.categoryRepository.create({
        ...createCategoryDto,
        userId,
      });

      const savedCategory = await this.categoryRepository.save(category);
      return this.toResponseDto(savedCategory);
    } catch (error) {
      this.handleDBExceptions(error, createCategoryDto.name);
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<CategoryResponseDto> {
    const category = await this.findOneEntity(id, userId);

    try {
      this.categoryRepository.merge(category, updateCategoryDto);
      const savedCategory = await this.categoryRepository.save(category);

      return this.toResponseDto(savedCategory);
    } catch (error) {
      const categoryName = updateCategoryDto.name || category.name;
      this.handleDBExceptions(error, categoryName);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.categoryRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Categoría con ID "${id}" no encontrada`);
    }
  }

  private handleDBExceptions(error: unknown, categoryName?: string): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${categoryName}".`,
      );
    }

    const err = error as { message?: string; stack?: string };
    this.logger.error(
      `Error de base de datos: ${err.message || 'Error desconocido'}`,
      err.stack,
    );

    throw new InternalServerErrorException(
      'Error inesperado al procesar la operación de categoría.',
    );
  }

  private async findOneEntity(
    id: string,
    userId: string,
  ): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException(`La categoría con ID "${id}" no existe.`);
    }

    return category;
  }

  private toResponseDto(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
