import { Task } from '../../domain/task/task.entity';

export abstract class TasksRepositoryPort {
  abstract findAllByListId(taskListId: string): Promise<Task[]>;
  abstract findById(id: string): Promise<Task | null>;
  abstract create(data: {
    title: string;
    notes?: string;
    taskListId: string;
    order: number;
  }): Promise<Task>;
  abstract update(
    id: string,
    data: {
      title?: string;
      notes?: string | null;
      completed?: boolean;
      order?: number;
      taskListId?: string;
    },
  ): Promise<Task>;
  abstract delete(id: string): Promise<void>;
  abstract getMaxOrderForList(taskListId: string): Promise<number>;
}
