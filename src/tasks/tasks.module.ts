import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';


@Module({
  imports: [
    // Inyecta el repositorio de TaskEntity en el ámbito de este módulo
    TypeOrmModule.forFeature([TaskEntity])
  ],
  providers: [TasksService],
  controllers: [TasksController]
})
export class TasksModule {}
