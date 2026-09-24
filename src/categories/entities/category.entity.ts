import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Unique,
  Index,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { v7 as uuidv7 } from 'uuid';

@Entity('categories')
@Unique(['name', 'userId'])
@Index(['userId'])
export class CategoryEntity {
  @ApiProperty({
    description: 'Identificador único UUID v7 de la categoría',
    example: '018f3ab1-2c3d-7e4f-8a9b-0c1d2e3f4a5b',
  })
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @ApiProperty({
    description: 'Nombre asignado a la categoría',
    example: 'Work',
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
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
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización',
    example: '2026-09-15T19:02:10.149Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Clave foránea explícita requerida por las consultas directas en servicios
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Cada categoría pertenece a un usuario (Aislamiento por usuario)
  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.categories, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Una categoría puede estar en muchas tareas
  @ApiHideProperty()
  @ManyToMany(() => TaskEntity, (task) => task.categories)
  tasks: TaskEntity[];
}
