import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MediaService } from '../../services/media.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { Media } from '../../core/models/media.model';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCard],
  templateUrl: './details.html',
  styleUrls: ['./details.scss']
})
export class Details implements OnInit, OnDestroy {
  media: Media | null = null;
  type: string = 'movie';
  trailerUrl: SafeResourceUrl | null = null;
  vidfastUrl: SafeResourceUrl | null = null;
  
  // ── TV Series variables ─────────────────────────────────────────────────────
  selectedSeason: any | null = null;
  seasonEpisodes: any[] = [];
  isLoadingEpisodes: boolean = false;
  selectedEpisode: any | null = null;
  // ────────────────────────────────────────────────────────────────────────────

  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private mediaService: MediaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.type = params.get('type') || 'movie';
      const id = params.get('id');
      if (id) {
        this.loadDetails(id, this.type);
      }
    });
  }

  loadDetails(id: string, type: string) {
    this.media = null;
    this.selectedSeason = null;
    this.seasonEpisodes = [];
    this.selectedEpisode = null;
    this.vidfastUrl = null;
    this.trailerUrl = null;
    
    window.scrollTo(0, 0);
    this.mediaService.getDetails(id, type).subscribe({
      next: (data) => {
        if (data.similar?.results) {
          data.similar.results.forEach(s => s.media_type = type as any);
        }
        this.media = data;
        this.extractTrailer();

        // Auto-seleccionar primer temporada si es serie y tiene temporadas
        if (type === 'tv' && this.media?.seasons && this.media.seasons.length > 0) {
          // A veces la temporada 0 son Especiales, mejor la primera que tenga episodios
          const firstSeason = this.media.seasons.find(s => s.season_number > 0) || this.media.seasons[0];
          this.selectSeason(firstSeason);
        }
      },
      error: () => {
        // Redirigir si hay error de carga inicial
      }
    });
  }

  extractTrailer() {
    this.trailerUrl = null;
    this.vidfastUrl = null;
    
    // Generación del reproductor automático Vidfast SOLO PARA PELICULAS
    if (this.media?.id && this.type === 'movie') {
       const url = `https://vidfast.pro/movie/${this.media.id}?autoPlay=false`;
       this.vidfastUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    // Si es serie, el URL se generará al elegir un episodio

    if (this.media?.videos?.results) {
      const trailer = this.media.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=0`);
      }
    }
  }

  // ── Manejo de Series (Temporadas y Episodios) ───────────────────────────────
  selectSeason(season: any) {
    if (!this.media?.id) return;
    this.selectedSeason = season;
    this.selectedEpisode = null; // Reiniciar
    this.vidfastUrl = null;      // Ocultar player hasta elegir episodio
    this.isLoadingEpisodes = true;
    this.seasonEpisodes = [];

    this.mediaService.getSeasonDetails(this.media.id, season.season_number).subscribe({
      next: (data) => {
        // TMDB devuelve max ~25 episodios de golpe, no pesa casi nada.
        this.seasonEpisodes = data.episodes || [];
        this.isLoadingEpisodes = false;
        
        // Hacer scroll suave a la sección de episodios
        setTimeout(() => {
          document.getElementById('episodes-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: () => {
        this.isLoadingEpisodes = false;
      }
    });
  }

  selectEpisode(episode: any) {
    if (!this.media?.id || !this.selectedSeason) return;
    this.selectedEpisode = episode;
    const url = `https://vidfast.pro/tv/${this.media.id}/${this.selectedSeason.season_number}/${episode.episode_number}?autoPlay=true`;
    this.vidfastUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    setTimeout(() => {
      document.getElementById('vidfast-player-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  // ────────────────────────────────────────────────────────────────────────────

  getYear(dateStr?: string): string {
    return dateStr ? new Date(dateStr).getFullYear().toString() : 'N/A';
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
}
