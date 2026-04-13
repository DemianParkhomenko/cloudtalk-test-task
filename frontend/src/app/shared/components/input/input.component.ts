import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="input-wrapper" [class.input-wrapper--error]="!!error()">
      @if (label()) {
      <label [for]="inputId" class="input-label">{{ label() }}</label>
      }
      @if (type() !== 'textarea') {
      <input
        [id]="inputId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="input-field"
        [attr.autocomplete]="autocomplete()"
      />
      }
      @if (type() === 'textarea') {
      <textarea
        [id]="inputId"
        [placeholder]="placeholder()"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        class="input-field input-field--textarea"
        rows="3"
      ></textarea>
      }
      @if (error()) {
      <p class="input-error">{{ error() }}</p>
      }
    </div>
  `,
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly type = input<'text' | 'email' | 'password' | 'textarea'>('text');
  readonly placeholder = input('');
  readonly error = input('');
  readonly autocomplete = input('');

  private static idCounter = 0;
  inputId = `input-${++InputComponent.idCounter}`;

  value = '';
  disabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);
  }
}
