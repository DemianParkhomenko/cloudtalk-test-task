import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/tasks/tasks.service';
import { TaskList } from '../../../core/tasks/task-lists.service';
import { CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';
import {
  DropdownMenuComponent,
  DropdownItem,
} from '../../../shared/components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-task-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CheckboxComponent, DropdownMenuComponent],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss',
})
export class TaskItemComponent {
  readonly task = input.required<Task>();
  readonly allLists = input<TaskList[]>([]);

  readonly taskCompleted = output<Task>();
  readonly taskEdit = output<Task>();
  readonly taskDeleted = output<string>();
  readonly taskMoved = output<{ taskId: string; targetListId: string }>();

  get menuItems(): DropdownItem[] {
    const task = this.task();
    const moveItems = this.allLists()
      .filter((l) => l.id !== task.taskListId)
      .map((l) => ({ label: `Move to "${l.name}"`, action: `move:${l.id}` }));

    return [
      { label: 'Edit task', action: 'edit' },
      ...moveItems,
      { label: 'Delete task', action: 'delete', danger: true },
    ];
  }

  onMenuAction(action: string): void {
    const task = this.task();

    if (action === 'edit') {
      this.taskEdit.emit(task);
    } else if (action === 'delete') {
      this.taskDeleted.emit(task.id);
    } else if (action.startsWith('move:')) {
      const targetListId = action.slice(5);
      this.taskMoved.emit({ taskId: task.id, targetListId });
    }
  }
}
