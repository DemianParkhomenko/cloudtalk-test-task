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
import { TaskListsService } from '../../../application/services/task-lists/task-lists.service';
import { CurrentUser } from '../../../lib/decorators/current-user.decorator';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { UpdateTaskListOrderDto } from './dto/update-task-list-order.dto';

@ApiTags('task-lists')
@ApiBearerAuth()
@Controller('task-lists')
export class TaskListsController {
  constructor(private readonly taskListsService: TaskListsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all task lists for the authenticated user' })
  findAll(@CurrentUser('sub') userId: string) {
    return this.taskListsService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task list' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateTaskListDto) {
    return this.taskListsService.create(userId, dto.name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task list name' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTaskListDto,
  ) {
    return this.taskListsService.update(id, userId, dto.name);
  }

  @Patch(':id/order')
  @ApiOperation({ summary: 'Update task list order' })
  updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTaskListOrderDto,
  ) {
    return this.taskListsService.updateOrder(id, userId, dto.order);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task list' })
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return this.taskListsService.delete(id, userId);
  }
}
