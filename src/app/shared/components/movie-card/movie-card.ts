import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Media } from '../../../core/models/media.model';
import { HashService } from '../../../services/hash.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card.html',
  styleUrls: ['./movie-card.scss']
})
export class MovieCard {
  @Input() movie!: Media;
  private hashService = inject(HashService);

  get hashedId(): string {
    return this.hashService.encode(this.movie.id);
  }

  get mediaType(): string {
     return this.movie.media_type || (this.movie.title ? 'movie' : 'tv');
  }
}
