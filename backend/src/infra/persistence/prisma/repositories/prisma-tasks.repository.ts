import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TasksRepositoryPort } from '../../../../application/ports/tasks.repository.port';
import { Task } from '../../../../domain/task/task.entity';

@Injectable()
export class PrismaTasksRepository implements TasksRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByListId(taskListId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { taskListId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async create(data: {
    title: string;
    notes?: string;
    taskListId: string;
    order: number;
  }): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async update(
    id: string,
    data: {
      title?: string;
      notes?: string | null;
      completed?: boolean;
      order?: number;
      taskListId?: string;
    },
  ): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async getMaxOrderForList(taskListId: string): Promise<number> {
    const result = await this.prisma.task.aggregate({
      where: { taskListId },
      _max: { order: true },
    });
    return result._max.order ?? -1;
  }
}
