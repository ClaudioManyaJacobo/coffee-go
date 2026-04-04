import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MediaService } from '../../services/media.service';
import { HashService } from '../../services/hash.service';
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
  
  // ── Variables para Series de TV ─────────────────────────────────────────────
  selectedSeason: any | null = null;
  seasonEpisodes: any[] = [];
  isLoadingEpisodes: boolean = false;
  selectedEpisode: any | null = null;
  // ────────────────────────────────────────────────────────────────────────────

  private routeSub!: Subscription;
  private hashService = inject(HashService);

  constructor(
    private route: ActivatedRoute,
    private mediaService: MediaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.type = params.get('type') || 'movie';
      const hashedId = params.get('id');
      
      if (hashedId) {
        // Desofuscamos el ID antes de usarlo
        const realId = this.hashService.decode(hashedId);
        this.loadDetails(realId, this.type);
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

        // Auto-seleccionar la primera temporada si es una serie
        if (type === 'tv' && this.media?.seasons && this.media.seasons.length > 0) {
          // Priorizamos la primera temporada con episodios (a veces existe temporada 0 de Especiales)
          const firstSeason = this.media.seasons.find(s => s.season_number > 0) || this.media.seasons[0];
          this.selectSeason(firstSeason);
        }
      },
      error: () => {
        // Manejar error de carga (ej. redirigir al inicio)
      }
    });
  }

  extractTrailer() {
    this.trailerUrl = null;
    this.vidfastUrl = null;
    
    // Generación del reproductor automático Vidfast SOLO PARA PELÍCULAS
    if (this.media?.id && this.type === 'movie') {
       const url = `https://vidfast.pro/movie/${this.media.id}?autoPlay=false`;
       this.vidfastUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    // Si es serie, el URL se generará al elegir un episodio específico

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
    this.selectedEpisode = null; // Reiniciar selección de episodio
    this.vidfastUrl = null;      // Ocultar reproductor hasta elegir nuevo episodio
    this.isLoadingEpisodes = true;
    this.seasonEpisodes = [];

    this.mediaService.getSeasonDetails(this.media.id, season.season_number).subscribe({
      next: (data) => {
        // TMDB devuelve la lista completa de episodios de la temporada
        this.seasonEpisodes = data.episodes || [];
        this.isLoadingEpisodes = false;
        
        // Desplazamiento suave a la sección de episodios
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

    // Desplazamiento suave al reproductor Vidfast
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
