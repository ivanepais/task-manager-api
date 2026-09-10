/*
import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { Task } from './task.model';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Task {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: { title: string; description: string }): Task {
    return this.tasksService.create(body.title, body.description);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: { title?: string; description?: string; completed?: boolean },
  ): Task {
    return this.tasksService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.tasksService.remove(id);
  }
}
*/

import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { Task } from './task.model';
// 1. Importamos los DTOs
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Task {
    return this.tasksService.findOne(id);
  }

  // 2. Reemplazamos el objeto anónimo por CreateTaskDto
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.create(createTaskDto);
  }

  // 3. Reemplazamos el objeto anónimo por UpdateTaskDto
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Task {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.tasksService.remove(id);
  }
}