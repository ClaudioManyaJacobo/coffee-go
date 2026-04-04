import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Router added
import { MediaService } from '../../services/media.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Observable, Subscription } from 'rxjs';
import { Media, TrendingResponse } from '../../core/models/media.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCard, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  trending$!: Observable<TrendingResponse>;
  
  heroMovies: Media[] = [];
  currentHeroIndex = 0;
  heroMovie: Media | null = null;
  
  private carouselTimer: any;
  private dataSub?: Subscription;

  constructor(
    private mediaService: MediaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.trending$ = this.mediaService.getTrending();
    
    this.dataSub = this.trending$.subscribe((data) => {
      if (data && data.movies && data.movies.length > 0) {
        this.heroMovies = data.movies.slice(0, 5);
        this.heroMovie = this.heroMovies[this.currentHeroIndex];
        
        if (!this.carouselTimer) {
          this.startHeroCarousel();
        }
      }
    });
  }

  startHeroCarousel() {
    this.carouselTimer = setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroMovies.length;
      this.heroMovie = this.heroMovies[this.currentHeroIndex];
    }, 5000);
  }

  onInfoClick(event: any) {
    const btn = event.currentTarget as HTMLElement;
    btn.classList.add('glowing-info');
    setTimeout(() => {
      btn.classList.remove('glowing-info');
    }, 3000); // Brilla por 3 segundos
  }

  goToDetails(movie: Media) {
    this.router.navigate(['/details', movie.media_type || 'movie', movie.id]);
  }

  ngOnDestroy(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }
}
