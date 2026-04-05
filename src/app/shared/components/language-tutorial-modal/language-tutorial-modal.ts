import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-tutorial-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-tutorial-modal.html',
  styleUrls: ['./language-tutorial-modal.scss']
})
export class LanguageTutorialModal {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
