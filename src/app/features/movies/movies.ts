import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { LoadingService } from '../../services/loading.service';
import { Observable, BehaviorSubject, switchMap, tap, finalize } from 'rxjs';
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

  constructor(private mediaService: MediaService, private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.movies$ = this.page$.pipe(
      tap(() => {
        this.loadingService.show();
        window.scrollTo(0, 0);
      }),
      switchMap(page => this.mediaService.getPopularMovies(page)),
      tap(() => {
        // Los datos ya llegaron, la vista se está acomodando
        this.loadingService.hide();
      })
    );
  }

  nextPage() { this.page$.next(this.page$.value + 1); }
  prevPage() { if (this.page$.value > 1) { this.page$.next(this.page$.value - 1); } }
}
