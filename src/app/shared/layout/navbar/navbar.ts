import {
  Component, HostListener, OnInit, OnDestroy
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
  isScrolled    = false;
  searchControl = new FormControl('');
  suggestions: any[] = [];
  isLoading     = false;
  isOpen        = false;

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

  private fetchSuggestions(query: string) {
    this.cancelSearch();

    this.searchSub = this.mediaService.searchMedia(query, 1).subscribe({
      next: (data) => {
        this.suggestions = (data.results ?? []).slice(0, 6);
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

  preventBlur(event: MouseEvent) {
    event.preventDefault();
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
    this.isOpen = false;
    this.searchControl.setValue('', { emitEvent: false });
    this.suggestions = [];
    const hashedId = this.hashService.encode(item.id);
    this.router.navigate(['/details', item.media_type, hashedId]);
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
