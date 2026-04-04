import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Movies } from './features/movies/movies';
import { Series } from './features/series/series';
import { ErrorComponent } from './features/error/error';
import { Details } from './features/details/details';
import { SearchComponent } from './features/search/search';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'movies', component: Movies },
  { path: 'series', component: Series },
  { path: 'details/:type/:id', component: Details },
  { path: 'search', component: SearchComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'home' }
];
