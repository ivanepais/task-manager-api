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

import { TaskEntity } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // { select: false } evita que la contraseña se incluya automáticamente en las consultas SELECT
  @Column({ select: false })
  password: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column('simple-array', { default: 'user' })
  roles: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Normaliza el email a minúsculas antes de guardar o actualizar
  @BeforeInsert()
  @BeforeUpdate()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @OneToMany(() => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];
}