import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map, catchError, of } from 'rxjs';
import { Media, PaginatedResult, TrendingResponse } from '../core/models/media.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = 'http://localhost:3000/api';
  //private apiUrl = 'https://back-coffee-go.onrender.com/api';

  private cacheTrending$: Observable<TrendingResponse> | null = null;
  private cacheMovies: Map<number, Observable<PaginatedResult<Media>>> = new Map();
  private cacheSeries: Map<number, Observable<PaginatedResult<Media>>> = new Map();
  private cacheDetails: Map<string, Observable<Media>> = new Map();
  private cacheSearch: Map<string, Observable<PaginatedResult<Media>>> = new Map();

  constructor(private http: HttpClient) { }

  /** Obtiene las películas y series en tendencia de la semana */
  getTrending(): Observable<TrendingResponse> {
    if (!this.cacheTrending$) {
      this.cacheTrending$ = this.http.get<any>(`${this.apiUrl}/trending`).pipe(
        map(res => ({ 
          movies: res.movies || [], 
          series: res.series || [] 
        })),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(() => of({ movies: [], series: [] }))
      );
    }
    return this.cacheTrending$;
  }

  /** Obtiene películas populares con paginación */
  getPopularMovies(page: number = 1): Observable<PaginatedResult<Media>> {
    if (!this.cacheMovies.has(page)) {
      const req$ = this.http.get<any>(`${this.apiUrl}/movies/popular?page=${page}`).pipe(
        map(res => {
          const { ok, message, ...data } = res;
          return data as PaginatedResult<Media>;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(() => of({ page: 1, results: [], total_pages: 0, total_results: 0 }))
      );
      this.cacheMovies.set(page, req$);
    }
    return this.cacheMovies.get(page)!;
  }

  /** Obtiene series populares con paginación */
  getPopularSeries(page: number = 1): Observable<PaginatedResult<Media>> {
    if (!this.cacheSeries.has(page)) {
      const req$ = this.http.get<any>(`${this.apiUrl}/series/popular?page=${page}`).pipe(
        map(res => {
          const { ok, message, ...data } = res;
          return data as PaginatedResult<Media>;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(() => of({ page: 1, results: [], total_pages: 0, total_results: 0 }))
      );
      this.cacheSeries.set(page, req$);
    }
    return this.cacheSeries.get(page)!;
  }

  /** Obtiene el detalle completo de un ítem (película o serie) */
  getDetails(id: string | number, type: string = 'movie'): Observable<Media> {
    const key = `${type}-${id}`;
    if (!this.cacheDetails.has(key)) {
      const req$ = this.http.get<any>(`${this.apiUrl}/details/${type}/${id}`).pipe(
        map(res => {
          const { ok, message, ...data } = res;
          return data as Media;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.cacheDetails.set(key, req$);
    }
    return this.cacheDetails.get(key)!;
  }

  /** Búsqueda multiplataforma con caché */
  searchMedia(query: string, page: number = 1): Observable<PaginatedResult<Media>> {
    const key = `${query}:${page}`;
    if (!this.cacheSearch.has(key)) {
      const req$ = this.http
        .get<any>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}&page=${page}`)
        .pipe(
          map(res => {
            const { ok, message, ...data } = res;
            return data as PaginatedResult<Media>;
          }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
      this.cacheSearch.set(key, req$);
    }
    return this.cacheSearch.get(key)!;
  }

  /** Búsqueda para sugerencias — endpoint dedicado, sin paginación */
  searchSuggestions(query: string): Observable<PaginatedResult<Media>> {
    return this.http
      .get<any>(`${this.apiUrl}/suggestions?q=${encodeURIComponent(query)}`)
      .pipe(
        map(res => {
          const { ok, message, ...data } = res;
          return data as PaginatedResult<Media>;
        })
      );
  }

  /** Obtiene los episodios de una temporada específica de una serie */
  getSeasonDetails(id: string | number, seasonNumber: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/details/tv/${id}/season/${seasonNumber}`).pipe(
      map(res => {
        const { ok, message, ...data } = res;
        return data; // Devuelve los datos de la temporada
      })
    );
  }
}
