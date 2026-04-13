import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <button [type]="type()" [disabled]="disabled() || loading()" [class]="buttonClass">
      @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  get buttonClass(): string {
    return [
      'btn',
      `btn--${this.variant()}`,
      this.fullWidth() ? 'btn--full' : '',
      this.loading() ? 'btn--loading' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
