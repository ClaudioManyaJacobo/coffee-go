import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Observable, Subscription } from 'rxjs';
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
  private dataSub?: Subscription;

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.trending$ = this.mediaService.getTrending();
    
    // Nos suscribimos explícitamente aquí para que al regresar a /home,
    // si la data ya está cacheada, heroMovie se poble de forma síncrona
    // en la inicialización sin tener que esperar el pipe async del HTML.
    this.dataSub = this.trending$.subscribe((data) => {
      if (data && data.movies && data.movies.length > 0) {
        this.heroMovies = data.movies.slice(0, 5); // Tomamos el Top 5
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

  ngOnDestroy(): void {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }
}
