import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from '../../../application/services/tasks/tasks.service';
import { CurrentUser } from '../../../lib/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskOrderDto } from './dto/update-task-order.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('task-lists/:listId/tasks')
  @ApiOperation({ summary: 'Get all tasks for a task list' })
  findAll(@Param('listId', ParseUUIDPipe) listId: string, @CurrentUser('sub') userId: string) {
    return this.tasksService.findAllByList(listId, userId);
  }

  @Post('task-lists/:listId/tasks')
  @ApiOperation({ summary: 'Create a new task in a list' })
  create(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(listId, userId, {
      title: dto.title,
      notes: dto.notes,
    });
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, userId, {
      title: dto.title,
      notes: dto.notes,
      completed: dto.completed,
    });
  }

  @Patch('tasks/:id/order')
  @ApiOperation({ summary: 'Update task order within its list' })
  updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTaskOrderDto,
  ) {
    return this.tasksService.updateOrder(id, userId, dto.order);
  }

  @Patch('tasks/:id/move')
  @ApiOperation({ summary: 'Move a task to a different list' })
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.moveToList(id, userId, dto.targetListId, dto.order);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return this.tasksService.delete(id, userId);
  }
}
