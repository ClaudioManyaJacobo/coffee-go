import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { Media, PaginatedResult } from '../../core/models/media.model';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './series.html',
  styleUrls: ['./series.scss']
})
export class Series implements OnInit {
  page$ = new BehaviorSubject<number>(1);
  series$!: Observable<PaginatedResult<Media>>;

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.series$ = this.page$.pipe(
      switchMap(page => this.mediaService.getPopularSeries(page))
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
