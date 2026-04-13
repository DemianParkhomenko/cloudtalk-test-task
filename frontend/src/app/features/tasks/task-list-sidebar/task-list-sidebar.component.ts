import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskList } from '../../../core/tasks/task-lists.service';

@Component({
  selector: 'app-task-list-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './task-list-sidebar.component.html',
  styleUrl: './task-list-sidebar.component.scss',
})
export class TaskListSidebarComponent {
  readonly lists = input<TaskList[]>([]);
  readonly activeListId = input<string | null>(null);

  readonly listSelected = output<string>();
  readonly createList = output<void>();
}
