import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MediaService } from '../../../services/media.service';
import { Subscription } from 'rxjs';
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
  searchModalOpen = false;

  getDistance(idx: number): number {
    if (this.menuHover === null) return -1;
    return Math.abs(this.menuHover - idx);
  }

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private searchSub:  Subscription | null = null;
  private valueSub:   Subscription | null = null;
  private routerSub:  Subscription | null = null;

  constructor(
    private mediaService: MediaService,
    private router: Router,
    private hashService: HashService
  ) {}

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.searchControl.setValue('', { emitEvent: false });
      this.suggestions = [];
      this.isLoading   = false;
      this.isOpen      = false;
      this.menuOpen    = false;
      this.searchModalOpen = false;
    });

    this.valueSub = this.searchControl.valueChanges.subscribe(val => {
      const query = (val ?? '').trim();
      if (query.length < 3) {
        this.suggestions = [];
        this.isLoading = false;
        this.isOpen = false;
        this.cancelSearch();
      } else {
        this.isLoading = true;
        this.isOpen = true;
        this.suggestions = [];

        clearTimeout(this.debounceTimer!);
        this.debounceTimer = setTimeout(() => {
          this.fetchSuggestions(query);
        }, 300);
      }
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
    this.searchControl.setValue('', { emitEvent: false });
    this.suggestions = [];
    this.isLoading = false;
    this.isOpen = false;
  }

  closeMenu() {
    this.menuOpen = false;
    this.menuHover = null;
  }

  private fetchSuggestions(query: string) {
    this.cancelSearch();

    this.searchSub = this.mediaService.searchMedia(query, 1).subscribe({
      next: (data) => {
        this.suggestions = (data.results ?? []).slice(0, 8);
        this.isLoading = false;
        this.isOpen = this.suggestions.length > 0;
      },
      error: () => {
        this.isLoading   = false;
        this.isOpen      = false;
        this.suggestions = [];
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
    clearTimeout(this.debounceTimer!);
    this.cancelSearch();
    this.valueSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  onInputFocus() {
    const q = (this.searchControl.value ?? '').trim();
    if (q.length >= 3 && (this.suggestions.length > 0 || this.isLoading)) {
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
