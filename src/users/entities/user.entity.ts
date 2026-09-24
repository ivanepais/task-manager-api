import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { v7 as uuidv7 } from 'uuid';
import { Exclude } from 'class-transformer';

import { TaskEntity } from '../../tasks/entities/task.entity';
import { CategoryEntity } from '../../categories/entities/category.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Identificador único UUID v7 del usuario',
    example: '018f3a9e-1a2b-7c3d-8e4f-5a6b7c8d9e0f',
  })
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @ApiProperty({
    description: 'Correo electrónico único del usuario',
    example: 'pepe@example.com',
  })
  @Index('users_email_unique', { unique: true })
  @Column({
    length: 255,
  })
  email: string;

  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'Pepe',
    unique: true,
  })
  @Index('users_username_unique', { unique: true })
  @Column({ length: 30 })
  userName: string;

  @ApiProperty({
    description: 'Estado de la cuenta del usuario',
    example: true,
    default: true,
  })
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({
    type: 'text',
    nullable: true,
    name: 'hashed_refresh_token',
    select: false,
  })
  @Exclude()
  hashedRefreshToken?: string | null;

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

  @ApiHideProperty()
  @Exclude()
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  deletedAt?: Date | null;

  @ApiHideProperty()
  @OneToMany(() => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];

  @ApiHideProperty()
  @OneToMany(() => CategoryEntity, (category) => category.user)
  categories: CategoryEntity[];
}
