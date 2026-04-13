import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepositoryPort } from '../../ports/tasks.repository.port';
import { TaskListsRepositoryPort } from '../../ports/task-lists.repository.port';
import { Task } from '../../../domain/task/task.entity';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepositoryPort,
    private readonly taskListsRepository: TaskListsRepositoryPort,
  ) {}

  async findAllByList(taskListId: string, userId: string): Promise<Task[]> {
    await this.assertListOwnership(taskListId, userId);
    return this.tasksRepository.findAllByListId(taskListId);
  }

  async create(
    taskListId: string,
    userId: string,
    data: { title: string; notes?: string },
  ): Promise<Task> {
    await this.assertListOwnership(taskListId, userId);
    const maxOrder = await this.tasksRepository.getMaxOrderForList(taskListId);
    return this.tasksRepository.create({
      ...data,
      taskListId,
      order: maxOrder + 1,
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      notes?: string | null;
      completed?: boolean;
    },
  ): Promise<Task> {
    await this.assertTaskOwnership(id, userId);
    return this.tasksRepository.update(id, data);
  }

  async updateOrder(id: string, userId: string, order: number): Promise<Task> {
    const task = await this.assertTaskOwnership(id, userId);
    const tasks = await this.tasksRepository.findAllByListId(task.taskListId);

    const sorted = [...tasks].sort((a, b) =>
      a.order !== b.order ? a.order - b.order : a.id.localeCompare(b.id),
    );
    const remaining = sorted.filter((t) => t.id !== id);
    const clampedOrder = Math.max(0, Math.min(order, remaining.length));
    remaining.splice(clampedOrder, 0, task);

    let updatedTask = task;
    await Promise.all(
      remaining.map((t, index) => {
        if (t.order === index) {
          if (t.id === id) updatedTask = t;
          return Promise.resolve(t);
        }
        return this.tasksRepository.update(t.id, { order: index }).then((updated) => {
          if (updated.id === id) updatedTask = updated;
          return updated;
        });
      }),
    );

    return updatedTask;
  }

  async moveToList(
    id: string,
    userId: string,
    targetListId: string,
    order?: number,
  ): Promise<Task> {
    const task = await this.assertTaskOwnership(id, userId);
    await this.assertListOwnership(targetListId, userId);

    const sourceListId = task.taskListId;

    // Reindex source list without the moved task
    const sourceTasks = await this.tasksRepository.findAllByListId(sourceListId);
    const sourceSorted = sourceTasks
      .filter((t) => t.id !== id)
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.id.localeCompare(b.id)));

    await Promise.all(
      sourceSorted.map((t, index) => {
        if (t.order === index) return Promise.resolve(t);
        return this.tasksRepository.update(t.id, { order: index });
      }),
    );

    // Reindex target list and insert moved task at desired position
    const targetTasks = await this.tasksRepository.findAllByListId(targetListId);
    const targetSorted = targetTasks.sort((a, b) =>
      a.order !== b.order ? a.order - b.order : a.id.localeCompare(b.id),
    );
    const newOrder =
      order !== undefined ? Math.max(0, Math.min(order, targetSorted.length)) : targetSorted.length;

    targetSorted.splice(newOrder, 0, { ...task, taskListId: targetListId, order: newOrder });

    let movedTask = task;
    await Promise.all(
      targetSorted.map((t, index) => {
        if (t.id === id) {
          return this.tasksRepository
            .update(id, { taskListId: targetListId, order: index })
            .then((updated) => {
              movedTask = updated;
              return updated;
            });
        }
        if (t.order === index) return Promise.resolve(t);
        return this.tasksRepository.update(t.id, { order: index });
      }),
    );

    return movedTask;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.assertTaskOwnership(id, userId);
    return this.tasksRepository.delete(id);
  }

  private async assertListOwnership(listId: string, userId: string): Promise<void> {
    const list = await this.taskListsRepository.findById(listId);
    if (!list) throw new NotFoundException('Task list not found');
    if (list.userId !== userId) throw new ForbiddenException('Access denied');
  }

  private async assertTaskOwnership(taskId: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    await this.assertListOwnership(task.taskListId, userId);
    return task;
  }
}
