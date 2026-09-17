import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  // 1. Obtiene todas las categorías pertenecientes al usuario autenticado
  async findAll(user: User): Promise<CategoryEntity[]> {
    return await this.categoryRepository.find({
      where: { user: { id: user.id } },
      order: { name: 'ASC' },
    });
  }

  // 2. Busca una categoría por ID asegurando pertenencia al usuario
  async findOne(id: string, user: User): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!category) {
      throw new NotFoundException(`La categoría con ID "${id}" no existe.`);
    }

    return category;
  }

  // 3. Registra una nueva categoría para el usuario
  async create(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<CategoryEntity> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user,
    });

    await this.categoryRepository.save(category);
    delete (category as Partial<CategoryEntity>).user;
    return category;
  }

  // 4. Actualiza los datos de una categoría previa validación de propiedad
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: User,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id, user);
    const updatedCategory = this.categoryRepository.merge(
      category,
      updateCategoryDto,
    );
    return await this.categoryRepository.save(updatedCategory);
  }

  // 5. Elimina la categoría del usuario
  async remove(id: string, user: User): Promise<void> {
    const category = await this.findOne(id, user);
    await this.categoryRepository.remove(category);
  }
}