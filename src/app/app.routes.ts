import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Movies } from './features/movies/movies';
import { Series } from './features/series/series';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'movies', component: Movies },
  { path: 'series', component: Series },
  { path: '**', redirectTo: 'home' }
];
