import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media } from '../../../core/models/media.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrls: ['./movie-card.scss']
})
export class MovieCard {
  @Input() movie!: Media;
}
