import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';

export interface DropdownItem {
  label: string;
  action: string;
  danger?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, OverlayModule],
  template: `
    <div class="dropdown" [class.dropdown--open]="isOpen">
      <div
        #trigger="cdkOverlayOrigin"
        cdkOverlayOrigin
        class="dropdown__trigger"
        (click)="toggle()"
      >
        <ng-content select="[trigger]" />
      </div>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isOpen"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayHasBackdrop]="false"
        (overlayOutsideClick)="close()"
        (detach)="close()"
      >
        <ul class="dropdown__menu" role="menu">
          @for (item of items(); track item.action) {
          <li
            role="none"
            class="dropdown__item"
            [class.dropdown__item--danger]="item.danger"
          >
            <button
              type="button"
              role="menuitem"
              class="dropdown__item-btn"
              (click)="onItemClick(item)"
            >
              {{ item.label }}
            </button>
          </li>
          }
        </ul>
      </ng-template>
    </div>
  `,
  styleUrl: './dropdown-menu.component.scss',
})
export class DropdownMenuComponent {
  readonly items = input<DropdownItem[]>([]);
  readonly itemSelected = output<string>();

  isOpen = false;

  readonly positions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 6,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -6,
    },
  ];

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  onItemClick(item: DropdownItem): void {
    this.itemSelected.emit(item.action);
    this.isOpen = false;
  }
}
