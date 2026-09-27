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
import { v7 as uuidv7 } from 'uuid';

@Entity('categories')
@Unique(['name', 'userId'])
@Index(['userId'])
export class CategoryEntity {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 7, default: '#4A90E2' })
  color: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.categories, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => TaskEntity, (task) => task.categories)
  tasks: TaskEntity[];
}
