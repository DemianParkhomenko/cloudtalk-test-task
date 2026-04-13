import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskList } from '../../../core/tasks/task-lists.service';
import { Task, TasksService } from '../../../core/tasks/tasks.service';
import { TaskListsService } from '../../../core/tasks/task-lists.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskCreateInlineComponent } from '../task-create-inline/task-create-inline.component';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { TaskListModalComponent } from '../task-list-modal/task-list-modal.component';
import {
  DropdownMenuComponent,
  DropdownItem,
} from '../../../shared/components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-task-list-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DragDropModule,
    TaskItemComponent,
    TaskCreateInlineComponent,
    TaskModalComponent,
    TaskListModalComponent,
    DropdownMenuComponent,
  ],
  templateUrl: './task-list-column.component.html',
  styleUrl: './task-list-column.component.scss',
})
export class TaskListColumnComponent {
  readonly list = input.required<TaskList>();
  readonly tasks = input<Task[]>([]);
  readonly allLists = input<TaskList[]>([]);

  readonly listDeleted = output<string>();

  private readonly tasksService = inject(TasksService);
  private readonly taskListsService = inject(TaskListsService);

  readonly showCreateTask = signal(false);
  readonly editingTask = signal<Task | null>(null);
  readonly showEditListModal = signal(false);
  readonly isDropActive = signal(false);

  readonly listMenuItems: DropdownItem[] = [
    { label: 'Rename list', action: 'rename' },
    { label: 'Delete list', action: 'delete', danger: true },
  ];

  get connectedLists(): string[] {
    return this.allLists()
      .filter((l) => l.id !== this.list().id)
      .map((l) => `list-drop-${l.id}`);
  }

  get dropListId(): string {
    return `list-drop-${this.list().id}`;
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    const { previousContainer, container, previousIndex, currentIndex } = event;

    if (previousContainer === container) {
      const previous = [...event.container.data];

      // Reorder within same list — mutate the bound data array directly so CDK reflects the new order
      moveItemInArray(event.container.data, previousIndex, currentIndex);
      const movedTask = event.container.data[currentIndex];

      this.tasksService
        .updateOrder(movedTask.id, this.list().id, currentIndex)
        .pipe(
          catchError(() => {
            event.container.data.splice(0, event.container.data.length, ...previous);
            return of(null);
          }),
        )
        .subscribe();
    } else {
      // Move to different list
      const sourceListId = previousContainer.id.replace('list-drop-', '');
      const task = previousContainer.data[previousIndex] as Task;
      const previousSource = [...previousContainer.data];
      const previousTarget = [...container.data];

      this.tasksService
        .moveToList(task.id, sourceListId, this.list().id, currentIndex)
        .pipe(
          catchError(() => {
            previousContainer.data.splice(0, previousContainer.data.length, ...previousSource);
            container.data.splice(0, container.data.length, ...previousTarget);
            return of(null);
          }),
        )
        .subscribe();
    }

    this.isDropActive.set(false);
  }

  onDropListEntered(): void {
    this.isDropActive.set(true);
  }

  onDropListExited(): void {
    this.isDropActive.set(false);
  }

  onTaskDragStarted(_taskId: string): void {}

  onTaskDragEnded(): void {
    this.isDropActive.set(false);
  }

  onListMenuAction(action: string): void {
    if (action === 'rename') {
      this.showEditListModal.set(true);
    } else if (action === 'delete') {
      this.listDeleted.emit(this.list().id);
    }
  }

  onListRenamed(name: string): void {
    this.taskListsService
      .update(this.list().id, name)
      .pipe(catchError(() => this.taskListsService.loadLists().pipe(map(() => null))))
      .subscribe();

    this.showEditListModal.set(false);
  }

  onTaskCreated(data: { title: string; notes?: string }): void {
    this.tasksService
      .create(this.list().id, data)
      .pipe(catchError(() => this.tasksService.loadTasksForList(this.list().id).pipe(map(() => null))))
      .subscribe();

    this.showCreateTask.set(false);
  }

  onTaskEdited(data: { title?: string; notes?: string | null; completed?: boolean }): void {
    const task = this.editingTask();
    if (!task) return;

    this.tasksService
      .update(task.id, data)
      .pipe(catchError(() => this.tasksService.loadTasksForList(this.list().id).pipe(map(() => null))))
      .subscribe();

    this.editingTask.set(null);
  }

  onTaskDeleted(taskId: string): void {
    this.tasksService
      .delete(taskId, this.list().id)
      .pipe(catchError(() => this.tasksService.loadTasksForList(this.list().id).pipe(map(() => null))))
      .subscribe();
  }

  onTaskMoved(event: { taskId: string; targetListId: string }): void {
    this.tasksService
      .moveToList(event.taskId, this.list().id, event.targetListId)
      .pipe(
        catchError(() =>
          this.tasksService
            .loadTasksForList(this.list().id)
            .pipe(switchMap(() => this.tasksService.loadTasksForList(event.targetListId)), map(() => null)),
        ),
      )
      .subscribe();
  }

  onTaskCompleted(task: Task): void {
    this.tasksService
      .update(task.id, { completed: !task.completed })
      .pipe(catchError(() => this.tasksService.loadTasksForList(this.list().id).pipe(map(() => null))))
      .subscribe();
  }
}
