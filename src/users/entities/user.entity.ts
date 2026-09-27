import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
  Index,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Exclude } from 'class-transformer';

import { TaskEntity } from '../../tasks/entities/task.entity';
import { CategoryEntity } from '../../categories/entities/category.entity';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Index('users_email_unique', { unique: true })
  @Column({
    length: 255,
  })
  email: string;

  @Column({ select: false })
  password: string;

  @Index('users_username_unique', { unique: true })
  @Column({ length: 30 })
  userName: string;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
    select: false,
  })
  deletedAt?: Date | null;

  @OneToMany(() => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.user)
  categories: CategoryEntity[];
}
