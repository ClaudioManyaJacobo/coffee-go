import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Media } from '../../../core/models/media.model';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.html',
  styleUrls: ['./movie-card.scss']
})
export class MovieCard {
  @Input() movie!: Media;
}
