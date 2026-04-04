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
    window.scrollTo(0, 0);
    this.mediaService.getDetails(id, type).subscribe(data => {
      // Forzar que el similar sepa su tipo
      if (data.similar?.results) {
        data.similar.results.forEach(s => s.media_type = type as any);
      }
      this.media = data;
      this.extractTrailer();
    });
  }

  extractTrailer() {
    this.trailerUrl = null;
    if (this.media?.videos?.results) {
      const trailer = this.media.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=0`);
      }
    }
  }

  getYear(dateStr?: string): string {
    return dateStr ? new Date(dateStr).getFullYear().toString() : 'N/A';
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
}
