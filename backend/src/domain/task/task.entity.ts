export interface Task {
  id: string;
  title: string;
  notes: string | null;
  completed: boolean;
  order: number;
  taskListId: string;
  createdAt: Date;
  updatedAt: Date;
}
