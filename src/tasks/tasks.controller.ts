import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TasksService } from './tasks.service';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@GetUser() user: User): Promise<TaskEntity[]> {
    return await this.tasksService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User,): Promise<TaskEntity> {
    return await this.tasksService.findOne(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User,): Promise<TaskEntity> {
    return await this.tasksService.create(createTaskDto, user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto, @GetUser() user: User,
  ): Promise<TaskEntity> {
    return await this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User,): Promise<void> {
    await this.tasksService.remove(id, user);
  }
}