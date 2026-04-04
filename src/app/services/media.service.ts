import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, shareReplay } from 'rxjs';
import { Media, PaginatedResult, TrendingResponse } from '../core/models/media.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = 'https://back-coffee-go.onrender.com/api';

  // Caché interna para evitar peticiones redundantes
  private cacheTrending$: Observable<TrendingResponse> | null = null;
  private cacheMovies: Map<number, Observable<PaginatedResult<Media>>> = new Map();
  private cacheSeries: Map<number, Observable<PaginatedResult<Media>>> = new Map();
  private cacheDetails: Map<string, Observable<Media>> = new Map();

  constructor(private http: HttpClient) { }

  /** Obtiene las películas y series en tendencia de la semana */
  getTrending(): Observable<TrendingResponse> {
    if (!this.cacheTrending$) {
      this.cacheTrending$ = this.http.get<TrendingResponse>(`${this.apiUrl}/trending`).pipe(
        tap(data => console.log('DEBUG TRENDING:', data)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.cacheTrending$;
  }

  /** Obtiene películas populares con paginación */
  getPopularMovies(page: number = 1): Observable<PaginatedResult<Media>> {
    if (!this.cacheMovies.has(page)) {
      const req$ = this.http.get<PaginatedResult<Media>>(`${this.apiUrl}/movies/popular?page=${page}`).pipe(
        tap(data => console.log(`DEBUG MOVIES P${page}:`, data)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.cacheMovies.set(page, req$);
    }
    return this.cacheMovies.get(page)!;
  }

  /** Obtiene series populares con paginación */
  getPopularSeries(page: number = 1): Observable<PaginatedResult<Media>> {
    if (!this.cacheSeries.has(page)) {
      const req$ = this.http.get<PaginatedResult<Media>>(`${this.apiUrl}/series/popular?page=${page}`).pipe(
        tap(data => console.log(`DEBUG SERIES P${page}:`, data)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.cacheSeries.set(page, req$);
    }
    return this.cacheSeries.get(page)!;
  }

  /** Obtiene el detalle completo de un ítem (película o serie) */
  getDetails(id: string | number, type: string = 'movie'): Observable<Media> {
    const key = `${type}-${id}`;
    if (!this.cacheDetails.has(key)) {
      const req$ = this.http.get<Media>(`${this.apiUrl}/details/${type}/${id}`).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.cacheDetails.set(key, req$);
    }
    return this.cacheDetails.get(key)!;
  }

  /** Búsqueda multiplataforma (no utiliza caché interno para permitir frescura en resultados) */
  searchMedia(query: string, page: number = 1): Observable<PaginatedResult<Media>> {
    return this.http.get<PaginatedResult<Media>>(`${this.apiUrl}/search?q=${query}&page=${page}`);
  }

  /** Obtiene los episodios de una temporada específica de una serie */
  getSeasonDetails(id: string | number, seasonNumber: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/details/tv/${id}/season/${seasonNumber}`);
  }
}
