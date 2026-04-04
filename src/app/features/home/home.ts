import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { LoadingService } from '../../services/loading.service';
import { Observable, tap } from 'rxjs';
import { Media, TrendingResponse } from '../../core/models/media.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  trending$!: Observable<TrendingResponse>;
  
  heroMovies: Media[] = [];
  currentHeroIndex = 0;
  heroMovie: Media | null = null;
  private carouselTimer: any;

  constructor(private mediaService: MediaService, private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadingService.show();
    this.trending$ = this.mediaService.getTrending().pipe(
      tap((data) => {
        if (data && data.movies && data.movies.length > 0) {
          this.heroMovies = data.movies.slice(0, 5); // Tomamos el Top 5
          this.heroMovie = this.heroMovies[this.currentHeroIndex];
          this.startHeroCarousel();
        }
        this.loadingService.hide();
      })
    );
  }

  startHeroCarousel() {
    this.carouselTimer = setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroMovies.length;
      this.heroMovie = this.heroMovies[this.currentHeroIndex];
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
  }
}
