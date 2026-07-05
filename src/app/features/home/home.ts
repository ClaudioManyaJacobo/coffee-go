import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MediaService } from '../../services/media.service';
import { HashService } from '../../services/hash.service';
import { Observable, Subscription } from 'rxjs';
import { Media, TrendingResponse } from '../../core/models/media.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  trending$!: Observable<TrendingResponse>;

  heroMovies: Media[] = [];
  currentHeroIndex = 0;
  heroMovie: Media | null = null;

  hoveredMovie: Media | null = null;
  panelTop = 0;
  panelLeft = 0;

  private carouselTimer: any;
  private dataSub?: Subscription;
  private hashService = inject(HashService);

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

  onCardHover(movie: Media, event: MouseEvent) {
    const card = event.currentTarget as HTMLElement;
    const cardRect = card.getBoundingClientRect();
    const panelWidth = 400;
    const panelHeight = 178;
    const gap = 8;

    this.hoveredMovie = movie;

    let left = cardRect.left + (cardRect.width - panelWidth) / 2;
    left = Math.max(12, left);
    left = Math.min(window.innerWidth - panelWidth - 12, left);
    this.panelLeft = left;

    let top = cardRect.top - gap - panelHeight;
    if (top < 80) {
      top = cardRect.bottom + gap;
    }
    this.panelTop = top;
  }

  onCardLeave() {
    this.hoveredMovie = null;
  }

  getStarFills(movie: Media): number[] {
    const fullStars = Math.round(movie.vote_average / 2);
    const result: number[] = [];
    for (let i = 0; i < 5; i++) {
      result.push(i < fullStars ? 1 : 0);
    }
    return result;
  }

  goToDetails(movie: Media) {
    const hashedId = this.hashService.encode(movie.id);
    this.router.navigate(['/details', movie.media_type || 'movie', hashedId]);
  }

  goToHeroIndex(index: number) {
    this.currentHeroIndex = index;
    this.heroMovie = this.heroMovies[index];
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
