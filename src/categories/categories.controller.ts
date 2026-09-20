import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de categorías devuelta exitosamente.', type: [CategoryEntity] })
  @ApiResponse({ status: 401, description: 'Token JWT no provisto o inválido.' })
  async findAll(@GetUser() user: User): Promise<CategoryEntity[]> {
    return await this.categoriesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de una categoría por su UUID' })
  @ApiParam({ name: 'id', description: 'UUID v4 de la categoría', example: '8570f87c-1840-48ae-829b-d887a40d00cb' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada.', type: CategoryEntity, })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada o no pertenece al usuario.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<CategoryEntity> {
    return await this.categoriesService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva categoría' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente.', type: CategoryEntity, })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o formato de color incorrecto.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 409, description: 'Ya existe una categoría con ese nombre para este usuario.' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: User,
  ): Promise<CategoryEntity> {
    return await this.categoriesService.create(createCategoryDto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una categoría existente por su UUID' })
  @ApiParam({ name: 'id', description: 'UUID v4 de la categoría', example: '8570f87c-1840-48ae-829b-d887a40d00cb' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada exitosamente.', type: CategoryEntity, })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  @ApiResponse({ status: 409, description: 'Ya existe una categoría con ese nombre para este usuario.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ): Promise<CategoryEntity> {
    return await this.categoriesService.update(id, updateCategoryDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoría por su UUID' })
  @ApiParam({ name: 'id', description: 'UUID v4 de la categoría', example: '8570f87c-1840-48ae-829b-d887a40d00cb' })
  @ApiResponse({ status: 204, description: 'Categoría eliminada exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    await this.categoriesService.remove(id, user.id);
  }
}