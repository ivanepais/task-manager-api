import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // 1. Obtiene todas las categorías pertenecientes al usuario autenticado
  async findAll(userId: string): Promise<CategoryEntity[]> {
    return await this.categoryRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  // 2. Busca una categoría por ID asegurando pertenencia al usuario
  async findOne(id: string, userId: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException(`La categoría con ID "${id}" no existe.`);
    }

    return category;
  }

  // 3. Registra una nueva categoría para el usuario
  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<CategoryEntity> {
    try {
      const category = this.categoryRepository.create({
        ...createCategoryDto,
        userId,
      });

      return await this.categoryRepository.save(category);
    } catch (error) {
      this.handleDBExceptions(error, createCategoryDto.name);
    }
  }

  // 4. Actualiza los datos de una categoría previa validación de propiedad
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id, userId);

    try {
      this.categoryRepository.merge(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.handleDBExceptions(error, updateCategoryDto.name);
    }
  }

  // 5. Elimina la categoría del usuario
  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoryRepository.remove(category);
  }

  // Manejador centralizado para capturar errores de PostgreSQL
  private handleDBExceptions(error: any, categoryName?: string): never {
    if (error.code === '23505') {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${categoryName}".`,
      );
    }

    this.logger.error(`Error de base de datos: ${error.message}`, error.stack);
    throw new InternalServerErrorException(
      'Error inesperado al procesar la operación de categoría.',
    );
  }

}