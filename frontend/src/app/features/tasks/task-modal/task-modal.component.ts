import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Task } from '../../../core/tasks/tasks.service';
import { TaskList } from '../../../core/tasks/task-lists.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CheckboxComponent } from '../../../shared/components/checkbox/checkbox.component';

@Component({
  selector: 'app-task-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent, CheckboxComponent],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.scss',
})
export class TaskModalComponent implements OnInit {
  readonly task = input.required<Task>();
  readonly allLists = input<TaskList[]>([]);

  readonly save = output<{
    title?: string;
    notes?: string | null;
    completed?: boolean;
  }>();
  readonly dismissed = output<void>();
  readonly taskMoved = output<{ taskId: string; targetListId: string }>();

  private readonly fb = inject(FormBuilder);
  readonly loading = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
    notes: [''],
    completed: [false],
  });

  ngOnInit(): void {
    const task = this.task();
    this.form.patchValue({
      title: task.title,
      notes: task.notes ?? '',
      completed: task.completed,
    });
  }

  get otherLists(): TaskList[] {
    const task = this.task();
    return this.allLists().filter((l) => l.id !== task.taskListId);
  }

  get titleError(): string {
    const ctrl = this.form.get('title');
    if (!ctrl?.dirty) return '';
    if (ctrl.hasError('required')) return 'Title is required';
    if (ctrl.hasError('maxlength')) return 'Title is too long';
    return '';
  }

  onSave(): void {
    if (this.form.invalid) return;
    const { title, notes, completed } = this.form.value;
    this.save.emit({
      title,
      notes: notes || null,
      completed: completed ?? false,
    });
  }

  onMove(targetListId: string): void {
    this.taskMoved.emit({ taskId: this.task().id, targetListId });
    this.dismissed.emit();
  }

  toggleCompleted(): void {
    const current = this.form.get('completed')?.value ?? false;
    this.form.patchValue({ completed: !current });
  }
}
