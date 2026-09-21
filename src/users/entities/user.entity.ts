import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';

import { TaskEntity } from '../../tasks/entities/task.entity';
import { CategoryEntity } from '../../categories/entities/category.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Identificador único UUID v4 del usuario',
    example: 'd3b07384-d113-44a6-a719-e6479a283f96',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'pepe@example.com',
  })
  @Column({
    unique: true,
    length: 255,
  })
  email: string;

  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'Pepe',
  })
  @Column({ name: 'user_name', length: 100 })
  userName: string;

  @ApiProperty({
    description: 'Estado de la cuenta del usuario',
    example: true,
    default: true,
  })
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty({
    description: 'Roles asignados al usuario en el sistema',
    example: ['user'],
    type: [String],
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @ApiProperty({
    description: 'Fecha y hora de registro del usuario',
    example: '2026-09-16T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización de perfil',
    example: '2026-09-16T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha y hora de desactivación/eliminació',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @ApiHideProperty()
  @OneToMany(() => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];

  @ApiHideProperty()
  @OneToMany(() => CategoryEntity, (category) => category.user)
  categories: CategoryEntity[];
}
