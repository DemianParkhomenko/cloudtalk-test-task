import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskListsRepositoryPort } from '../../../../application/ports/task-lists.repository.port';
import { TaskList } from '../../../../domain/task-list/task-list.entity';

@Injectable()
export class PrismaTaskListsRepository implements TaskListsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: string): Promise<TaskList[]> {
    return this.prisma.taskList.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<TaskList | null> {
    return this.prisma.taskList.findUnique({ where: { id } });
  }

  async create(data: { name: string; userId: string; order: number }): Promise<TaskList> {
    return this.prisma.taskList.create({ data });
  }

  async update(id: string, data: { name?: string; order?: number }): Promise<TaskList> {
    return this.prisma.taskList.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.taskList.delete({ where: { id } });
  }

  async getMaxOrderForUser(userId: string): Promise<number> {
    const result = await this.prisma.taskList.aggregate({
      where: { userId },
      _max: { order: true },
    });
    return result._max.order ?? -1;
  }
}
