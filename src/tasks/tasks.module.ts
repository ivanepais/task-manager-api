import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Inyecta el repositorio de TaskEntity en el ámbito de este módulo
    TypeOrmModule.forFeature([TaskEntity]),
    AuthModule,
  ],
  providers: [TasksService],
  controllers: [TasksController]
})
export class TasksModule {}
