import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Layout & Components
import { Navbar } from './shared/layout/navbar/navbar';
import { Footer } from './shared/layout/footer/footer';
import { Loading } from './shared/components/loading/loading';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    Navbar, 
    Footer, 
    Loading
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {

  constructor(public loadingService: LoadingService) {
  }

  ngOnInit(): void {
    // La carga inicial comienza en true desde el LoadingService
    // Permitimos que la pantalla de inicio cargue visualmente
    setTimeout(() => {
      this.loadingService.hide();
    }, 1500);
  }
}
