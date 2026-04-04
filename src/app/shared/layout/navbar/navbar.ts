import {
  Component, HostListener, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MediaService } from '../../../services/media.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {
  isScrolled    = false;
  searchControl = new FormControl('');
  suggestions: any[] = [];
  isLoading     = false;
  isOpen        = false;

  private debounceTimer: any = null;
  private searchSub:  Subscription | null = null;
  private valueSub:   Subscription | null = null;
  private routerSub:  Subscription | null = null;

  constructor(
    private mediaService: MediaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Limpiar input al cambiar de ruta
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.searchControl.setValue('', { emitEvent: false });
      this.suggestions = [];
      this.isLoading   = false;
      this.isOpen      = false;
    });

    this.valueSub = this.searchControl.valueChanges.subscribe(val => {
      this.onQueryChange((val ?? '').trim());
    });
  }

  private onQueryChange(query: string) {
    // Menos de 3 chars → cerrar todo
    if (query.length < 3) {
      clearTimeout(this.debounceTimer);
      this.cancelSearch();
      this.isLoading   = false;
      this.isOpen      = false;
      this.suggestions = [];
      this.cdr.detectChanges();
      return;
    }

    // Abrir panel con loading de inmediato (sin esperar debounce)
    this.isLoading = true;
    this.isOpen    = true;
    this.cdr.detectChanges();

    // Debounce para no saturar la API mientras el usuario escribe
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fetchSuggestions(query);
    }, 200);
  }

  private fetchSuggestions(query: string) {
    // Cancelar petición anterior en vuelo
    this.cancelSearch();

    this.searchSub = this.mediaService.searchMedia(query, 1).subscribe({
      next: (data) => {
        this.suggestions = (data.results ?? [])
          .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
          .slice(0, 6);
        this.isLoading = false;
        // Mantenemos abierto si hay resultados; si no hay, cerramos limpiamente
        this.isOpen = this.suggestions.length > 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading   = false;
        this.isOpen      = false;
        this.suggestions = [];
        this.cdr.detectChanges();
      }
    });
  }

  private cancelSearch() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
      this.searchSub = null;
    }
  }

  ngOnDestroy() {
    clearTimeout(this.debounceTimer);
    this.cancelSearch();
    this.valueSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  /** Evita que el blur cierre el panel antes de procesar el click */
  preventBlur(event: MouseEvent) {
    event.preventDefault();
  }

  onInputFocus() {
    const q = (this.searchControl.value ?? '').trim();
    if (q.length >= 3 && (this.suggestions.length > 0 || this.isLoading)) {
      this.isOpen = true;
      this.cdr.detectChanges();
    }
  }

  onInputBlur() {
    setTimeout(() => {
      this.isOpen = false;
      this.cdr.detectChanges();
    }, 220);
  }

  goToDetails(item: any) {
    this.isOpen = false;
    this.searchControl.setValue('', { emitEvent: false });
    this.suggestions = [];
    this.router.navigate(['/details', item.media_type, item.id]);
  }

  onVerTodos() {
    const val = this.searchControl.value?.trim();
    if (!val) return;
    this.isOpen = false;
    this.router.navigate(['/search'], { queryParams: { q: val } });
  }

  onSearchSubmit(event?: Event) {
    if (event) event.preventDefault();
    this.onVerTodos();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }
}
