import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { TaskList, TaskListsService } from '../../../core/tasks/task-lists.service';
import { Task, TasksService } from '../../../core/tasks/tasks.service';
import { TaskListColumnComponent } from '../task-list-column/task-list-column.component';
import { TaskListSidebarComponent } from '../task-list-sidebar/task-list-sidebar.component';
import { TaskListModalComponent } from '../task-list-modal/task-list-modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-task-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DragDropModule,
    TaskListColumnComponent,
    TaskListSidebarComponent,
    TaskListModalComponent,
    ButtonComponent,
  ],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
})
export class TaskBoardComponent implements OnInit {
  readonly taskListsService = inject(TaskListsService);
  readonly tasksService = inject(TasksService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  @ViewChildren(TaskListColumnComponent, { read: ElementRef })
  private readonly columnElements?: QueryList<ElementRef<HTMLElement>>;

  readonly lists = signal<TaskList[]>([]);
  readonly tasksByList = toSignal(this.tasksService.tasksByList$, {
    initialValue: new Map<string, Task[]>(),
  });
  readonly currentUser = this.authService.currentUser;
  readonly showCreateListModal = signal(false);
  readonly activeListId = signal<string | null>(null);

  ngOnInit(): void {
    this.taskListsService.lists$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lists) => {
        this.lists.set([...lists].sort((a, b) => a.order - b.order));
      });

    this.taskListsService
      .loadLists()
      .pipe(
        tap((res) => {
          this.activeListId.set(res.data[0]?.id ?? null);
        }),
        switchMap((res) => {
          if (res.data.length === 0) {
            return of([]);
          }

          return forkJoin(
            res.data.map((list) =>
              this.tasksService.loadTasksForList(list.id).pipe(catchError(() => of(null))),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  onListSelected(listId: string): void {
    this.activeListId.set(listId);

    this.ngZone.onStable
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const targetId = `list-column-${listId}`;
        const target = this.columnElements?.find((element) => element.nativeElement.id === targetId);
        target?.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      });
  }

  onListCreated(name: string): void {
    this.taskListsService
      .create(name)
      .pipe(
        tap((res) => {
          this.activeListId.set(res.data.id);
        }),
        switchMap((res) => this.tasksService.loadTasksForList(res.data.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.showCreateListModal.set(false);
  }

  onListDeleted(listId: string): void {
    this.taskListsService
      .delete(listId)
      .pipe(
        map(() => true),
        catchError(() =>
          this.taskListsService.loadLists().pipe(
            map(() => false),
            catchError(() => of(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((isDeleted) => {
        if (!isDeleted) {
          return;
        }

        this.tasksService.removeList(listId);
        const remaining = this.lists();
        this.activeListId.set(remaining[0]?.id ?? null);
      });
  }

  onColumnsDropped(event: CdkDragDrop<TaskList[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const previous = this.lists();
    const next = [...previous];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.lists.set(next);

    const moved = next[event.currentIndex];
    this.taskListsService
      .updateOrder(moved.id, event.currentIndex)
      .pipe(
        catchError(() => {
          this.lists.set(previous);
          return this.taskListsService.loadLists().pipe(
            tap((res) => {
              this.lists.set([...res.data].sort((a, b) => a.order - b.order));
            }),
            map(() => null),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  logout(): void {
    this.authService.logout();
  }

}
