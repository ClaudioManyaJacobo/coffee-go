import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MediaService } from '../../services/media.service';
import { LoadingService } from '../../services/loading.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCard],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class SearchComponent implements OnInit {
  query: string = '';
  results: any[] = [];
  page: number = 1;
  totalPages: number = 1;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mediaService: MediaService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      this.query = params['q'] || '';
      this.page = Number(params['page']) || 1;
      
      if (!this.query.trim()) {
        this.router.navigate(['/home']);
        return;
      }
      
      this.loadResults();
    });
  }

  loadResults() {
    this.isLoading = true;
    this.loadingService.show();
    window.scrollTo(0, 0);
    this.mediaService.searchMedia(this.query, this.page).subscribe({
      next: (data) => {
        this.results = data.results;
        this.totalPages = data.total_pages;
        this.isLoading = false;
        this.loadingService.hide();
      },
      error: () => {
        this.isLoading = false;
        this.loadingService.hide();
        this.router.navigate(['/error']);
      }
    });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.router.navigate(['/search'], { queryParams: { q: this.query, page: newPage } });
    }
  }
}
