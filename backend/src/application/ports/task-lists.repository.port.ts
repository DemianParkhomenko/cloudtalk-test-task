import { TaskList } from '../../domain/task-list/task-list.entity';

export abstract class TaskListsRepositoryPort {
  abstract findAllByUserId(userId: string): Promise<TaskList[]>;
  abstract findById(id: string): Promise<TaskList | null>;
  abstract create(data: { name: string; userId: string; order: number }): Promise<TaskList>;
  abstract update(id: string, data: { name?: string; order?: number }): Promise<TaskList>;
  abstract delete(id: string): Promise<void>;
  abstract getMaxOrderForUser(userId: string): Promise<number>;
}
