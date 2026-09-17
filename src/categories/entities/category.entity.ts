import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity('categories')
export class CategoryEntity {
  @ApiProperty({
    description: 'Identificador único UUID v4 de la categoría',
    example: '8570f87c-1840-48ae-829b-d887a40d00cb',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre asignado a la categoría',
    example: 'Trabajo',
  })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @ApiProperty({
    description: 'Código hexadecimal del color de la categoría',
    example: '#4A90E2',
    default: '#4A90E2',
  })
  @Column({ type: 'varchar', length: 7, default: '#4A90E2' })
  color: string;

  @ApiProperty({
    description: 'Fecha y hora de creación de la categoría',
    example: '2026-09-15T19:02:10.149Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización',
    example: '2026-09-15T19:02:10.149Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Cada categoría pertenece a un usuario (Aislamiento por usuario)
  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  user: User;

  // Una categoría puede estar en muchas tareas
  @ApiHideProperty()
  @ManyToMany(() => TaskEntity, (task) => task.categories)
  tasks: TaskEntity[];
}