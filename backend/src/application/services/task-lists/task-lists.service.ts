import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskListsRepositoryPort } from '../../ports/task-lists.repository.port';
import { TaskList } from '../../../domain/task-list/task-list.entity';

@Injectable()
export class TaskListsService {
  constructor(private readonly taskListsRepository: TaskListsRepositoryPort) {}

  async findAll(userId: string): Promise<TaskList[]> {
    return this.taskListsRepository.findAllByUserId(userId);
  }

  async create(userId: string, name: string): Promise<TaskList> {
    const maxOrder = await this.taskListsRepository.getMaxOrderForUser(userId);
    return this.taskListsRepository.create({
      name,
      userId,
      order: maxOrder + 1,
    });
  }

  async update(id: string, userId: string, name: string): Promise<TaskList> {
    await this.assertOwnership(id, userId);
    return this.taskListsRepository.update(id, { name });
  }

  async updateOrder(id: string, userId: string, order: number): Promise<TaskList> {
    const taskList = await this.assertOwnership(id, userId);
    const taskLists = await this.taskListsRepository.findAllByUserId(userId);

    const sorted = [...taskLists].sort((a, b) =>
      a.order !== b.order ? a.order - b.order : a.id.localeCompare(b.id),
    );
    const remaining = sorted.filter((l) => l.id !== id);
    const clampedOrder = Math.max(0, Math.min(order, remaining.length));
    remaining.splice(clampedOrder, 0, taskList);

    let updatedTaskList = taskList;
    await Promise.all(
      remaining.map((list, index) => {
        if (list.order === index) {
          if (list.id === id) updatedTaskList = list;
          return Promise.resolve(list);
        }
        return this.taskListsRepository.update(list.id, { order: index }).then((updated) => {
          if (updated.id === id) updatedTaskList = updated;
          return updated;
        });
      }),
    );

    return updatedTaskList;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);
    return this.taskListsRepository.delete(id);
  }

  async assertOwnership(id: string, userId: string): Promise<TaskList> {
    const taskList = await this.taskListsRepository.findById(id);
    if (!taskList) throw new NotFoundException('Task list not found');
    if (taskList.userId !== userId) throw new ForbiddenException('Access denied');
    return taskList;
  }
}
