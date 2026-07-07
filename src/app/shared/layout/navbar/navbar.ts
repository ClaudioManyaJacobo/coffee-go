import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  Subscription,
  switchMap
} from 'rxjs';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MediaService } from '../../../services/media.service';
import { HashService } from '../../../services/hash.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {
  menuOpen = false;
  menuHover: number | null = null;
  searchControl = new FormControl('');
  suggestions: any[] = [];
  isLoading     = false;
  isOpen        = false;
  hasError      = false;
  searchModalOpen = false;

  getDistance(idx: number): number {
    if (this.menuHover === null) return -1;
    return Math.abs(this.menuHover - idx);
  }

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private valueSub:      Subscription | null = null;
  private routerSub:     Subscription | null = null;
  private suggestionCache = new Map<string, any[]>();
  private readonly MIN_SEARCH_LENGTH = 3;
  private readonly SUGGESTION_CACHE_MAX = 50;

  constructor(
    private mediaService: MediaService,
    private router: Router,
    private hashService: HashService
  ) {}

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.resetSearchState();
      this.searchControl.setValue('');
    });

    this.valueSub = this.searchControl.valueChanges.pipe(
      map(val => (val ?? '').trim()),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(query => {
        this.hasError = false;

        if (query.length < this.MIN_SEARCH_LENGTH || !this.searchModalOpen) {
          this.clearSuggestionState();
          return of([]);
        }

        const cached = this.suggestionCache.get(query);
        if (cached) return of(cached);

        this.isLoading = true;
        return this.getSuggestions(query);
      })
    ).subscribe(items => {
      this.suggestions = items;
      this.isLoading = false;
      this.isOpen = items.length > 0;
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (event.key === 'Escape') {
      if (this.searchModalOpen) {
        this.closeSearch();
      } else if (this.menuOpen) {
        this.closeMenu();
      }
      return;
    }

    if (event.key === 'm' || event.key === 'M') {
      if (!isInput && !this.searchModalOpen) {
        event.preventDefault();
        this.menuOpen = !this.menuOpen;
      }
    }
  }

  openSearch() {
    this.menuOpen = false;
    this.searchModalOpen = true;
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 100);
  }

  closeSearch() {
    this.searchModalOpen = false;
    this.searchControl.setValue('');
    this.clearSuggestionState();
  }

  private clearSuggestionState() {
    this.suggestions = [];
    this.isLoading = false;
    this.isOpen = false;
    this.hasError = false;
  }

  private resetSearchState() {
    this.clearSuggestionState();
    this.menuOpen = false;
    this.searchModalOpen = false;
  }

  closeMenu() {
    this.menuOpen = false;
    this.menuHover = null;
  }

  private getSuggestions(query: string) {
    if (query.length < this.MIN_SEARCH_LENGTH) {
      return of([]);
    }

    const cached = this.suggestionCache.get(query);
    if (cached) return of(cached);

    return this.mediaService.searchSuggestions(query).pipe(
      map(data => {
        const items = (data.results ?? []).slice(0, 8);
        if (this.suggestionCache.size >= this.SUGGESTION_CACHE_MAX) {
          const firstKey = this.suggestionCache.keys().next().value;
          if (firstKey) this.suggestionCache.delete(firstKey);
        }
        this.suggestionCache.set(query, items);
        this.hasError = false;
        return items;
      }),
      catchError(() => {
        this.hasError = true;
        return of([]);
      })
    );
  }

  ngOnDestroy() {
    this.valueSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  onInputFocus() {
    const q = (this.searchControl.value ?? '').trim();
    if (q.length >= this.MIN_SEARCH_LENGTH && (this.suggestions.length > 0 || this.isLoading)) {
      this.isOpen = true;
    }
  }

  onInputBlur() {
    setTimeout(() => {
      this.isOpen = false;
    }, 200);
  }

  goToDetails(item: any) {
    this.closeSearch();
    const hashedId = this.hashService.encode(item.id);
    this.router.navigate(['/details', item.media_type, hashedId]);
  }

  onVerTodos() {
    const val = this.searchControl.value?.trim();
    if (!val) return;
    this.closeSearch();
    this.router.navigate(['/search'], { queryParams: { q: val } });
  }
}
