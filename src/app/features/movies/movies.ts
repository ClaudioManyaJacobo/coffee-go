import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { Media, PaginatedResult } from '../../core/models/media.model';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './movies.html',
  styleUrls: ['./movies.scss']
})
export class Movies implements OnInit {
  page$ = new BehaviorSubject<number>(1);
  movies$!: Observable<PaginatedResult<Media>>;

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.movies$ = this.page$.pipe(
      switchMap(page => this.mediaService.getPopularMovies(page))
    );
  }

  nextPage() { 
    this.page$.next(this.page$.value + 1); 
    window.scrollTo(0, 0); 
  }
  
  prevPage() { 
    if (this.page$.value > 1) { 
      this.page$.next(this.page$.value - 1); 
      window.scrollTo(0, 0); 
    } 
  }
}
