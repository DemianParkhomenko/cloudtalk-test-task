import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent],
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal" role="dialog" aria-modal="true" [attr.aria-label]="title()">
        <div class="modal__header">
          <h2 class="modal__title">{{ title() }}</h2>
          <app-button variant="icon" (click)="dismissed.emit()" aria-label="Close">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </app-button>
        </div>
        <div class="modal__body">
          <ng-content />
        </div>
        @if (showFooter()) {
        <div class="modal__footer">
          <app-button variant="ghost" (click)="dismissed.emit()">Cancel</app-button>
          <app-button
            [variant]="confirmVariant()"
            [disabled]="confirmDisabled()"
            [loading]="confirmLoading()"
            (click)="confirm.emit()"
          >
            {{ confirmLabel() }}
          </app-button>
        </div>
        }
      </div>
    </div>
  `,
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnInit, OnDestroy {
  readonly title = input('');
  readonly showFooter = input(true);
  readonly confirmLabel = input('Save');
  readonly confirmVariant = input<'primary' | 'danger'>('primary');
  readonly confirmDisabled = input(false);
  readonly confirmLoading = input(false);

  readonly dismissed = output<void>();
  readonly confirm = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private previousOverflow = '';

  ngOnInit(): void {
    this.previousOverflow = this.document.body.style.overflow;
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  ngOnDestroy(): void {
    this.renderer.setStyle(this.document.body, 'overflow', this.previousOverflow);
  }

  onEscape(): void {
    this.dismissed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.dismissed.emit();
    }
  }
}
