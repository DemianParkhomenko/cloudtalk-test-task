import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      role="checkbox"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="label()"
      class="checkbox"
      [class.checkbox--checked]="checked()"
      (click)="checkedChange.emit(!checked())"
    >
      @if (checked()) {
      <svg
        class="checkbox__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      }
    </button>
  `,
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  readonly checked = input(false);
  readonly label = input('');
  readonly checkedChange = output<boolean>();
}
