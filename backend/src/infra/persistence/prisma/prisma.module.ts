import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { PrismaTaskListsRepository } from './repositories/prisma-task-lists.repository';
import { PrismaTasksRepository } from './repositories/prisma-tasks.repository';
import { UsersRepositoryPort } from '../../../application/ports/users.repository.port';
import { TaskListsRepositoryPort } from '../../../application/ports/task-lists.repository.port';
import { TasksRepositoryPort } from '../../../application/ports/tasks.repository.port';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: UsersRepositoryPort, useClass: PrismaUsersRepository },
    { provide: TaskListsRepositoryPort, useClass: PrismaTaskListsRepository },
    { provide: TasksRepositoryPort, useClass: PrismaTasksRepository },
  ],
  exports: [PrismaService, UsersRepositoryPort, TaskListsRepositoryPort, TasksRepositoryPort],
})
export class PrismaModule {}
