import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-task-list-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent],
  template: `
    <app-modal
      [title]="mode() === 'create' ? 'Create new list' : 'Rename list'"
      [confirmLabel]="mode() === 'create' ? 'Create' : 'Save'"
      [confirmDisabled]="form.invalid"
      (dismissed)="dismissed.emit()"
      (confirm)="onSave()"
    >
      <form [formGroup]="form" (ngSubmit)="onSave()">
        <app-input
          label="List name"
          type="text"
          placeholder="Enter list name"
          formControlName="name"
          [error]="nameError"
        />
      </form>
    </app-modal>
  `,
})
export class TaskListModalComponent implements OnInit {
  readonly mode = input<'create' | 'edit'>('create');
  readonly initialName = input('');

  readonly save = output<string>();
  readonly dismissed = output<void>();

  private readonly fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    const initialName = this.initialName();
    if (initialName) {
      this.form.patchValue({ name: initialName });
    }
  }

  get nameError(): string {
    const ctrl = this.form.get('name');
    if (!ctrl?.dirty) return '';
    if (ctrl.hasError('required')) return 'Name is required';
    if (ctrl.hasError('maxlength')) return 'Name is too long';
    return '';
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.save.emit(this.form.getRawValue().name);
  }
}
