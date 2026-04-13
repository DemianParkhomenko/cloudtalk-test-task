import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-task-create-inline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="create-task">
      <input
        #titleInput
        type="text"
        formControlName="title"
        placeholder="Task title"
        class="create-task__input"
        (keydown.escape)="cancelled.emit()"
      />
      <input
        type="text"
        formControlName="notes"
        placeholder="Add details"
        class="create-task__input create-task__input--notes"
        (keydown.escape)="cancelled.emit()"
      />
      <div class="create-task__actions">
        <app-button type="submit" variant="primary" [disabled]="form.invalid">Add</app-button>
        <app-button type="button" variant="ghost" (click)="cancelled.emit()">Cancel</app-button>
      </div>
    </form>
  `,
  styleUrl: './task-create-inline.component.scss',
})
export class TaskCreateInlineComponent implements AfterViewInit {
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;

  readonly taskCreated = output<{ title: string; notes?: string }>();
  readonly cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    notes: [''],
  });

  ngAfterViewInit(): void {
    this.titleInput.nativeElement.focus();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { title, notes } = this.form.getRawValue();
    this.taskCreated.emit({ title, notes: notes || undefined });
    this.form.reset();
  }
}
