import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany
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
  @Column({ unique: true })
  email: string;

  // { select: false } evita que la contraseña se incluya automáticamente en las consultas SELECT
  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Pepe Perez',
  })
  @Column({ name: 'full_name' })
  fullName: string;

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
  @Column('simple-array', { default: 'user' })
  roles: string[];

  @ApiProperty({
    description: 'Fecha y hora de registro del usuario',
    example: '2026-09-16T12:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización de perfil',
    example: '2026-09-16T12:00:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha y hora de desactivación/eliminación lógica',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Normaliza el email a minúsculas antes de guardar o actualizar
  @BeforeInsert()
  @BeforeUpdate()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @ApiHideProperty()
  @OneToMany(() => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];
  
  @ApiHideProperty()
  @OneToMany(() => CategoryEntity, (category) => category.user)
  categories: CategoryEntity[];
}