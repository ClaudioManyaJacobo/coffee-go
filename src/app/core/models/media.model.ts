export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
}

export interface PaginatedResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TrendingResponse {
  movies: Media[];
  series: Media[];
}
