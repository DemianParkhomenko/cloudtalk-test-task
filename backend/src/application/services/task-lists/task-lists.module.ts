import { Module } from '@nestjs/common';
import { TaskListsService } from './task-lists.service';
import { TaskListsController } from '../../../infra/http/task-lists/task-lists.controller';

@Module({
  providers: [TaskListsService],
  controllers: [TaskListsController],
  exports: [TaskListsService],
})
export class TaskListsModule {}
