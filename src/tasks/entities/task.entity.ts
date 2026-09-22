import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { User } from '../../users/entities/user.entity';
import { CategoryEntity } from '../../categories/entities/category.entity';

@Entity('tasks')
@Index(['userId', 'completed'])
export class TaskEntity {
  @ApiProperty({
    description: 'Identificador único UUID v4 de la tarea',
    example: '7f61495f-64c8-42ad-aea8-6b6603984c70',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Título descriptivo de la tarea',
    example: 'Escribir una función que retorne "Hola Mundo!"',
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la tarea',
    example: 'Usando una función flecha.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Estado de completitud de la tarea',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @ApiProperty({
    description: 'Fecha y hora de creación de la tarea',
    example: '2026-09-16T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización',
    example: '2026-09-16T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiHideProperty()
  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true, select: false, })
  deletedAt?: Date;

  // Clave foránea explícita para evitar JOINs pesados en lecturas
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.tasks, { 
    onDelete: 'CASCADE', // Borra las tareas si se elimina el usuario en la BD
    eager: false,        // Evita JOINs automáticos no deseados (por defecto)
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relación Muchos a Muchos con Categorías
  @ApiPropertyOptional({
    description: 'Arreglo de categorías vinculadas a esta tarea',
    type: () => [CategoryEntity],
  })
  @ManyToMany(() => CategoryEntity, (category) => category.tasks, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'task_categories', // Nombre de la tabla pivote en PostgreSQL
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: CategoryEntity[];
}