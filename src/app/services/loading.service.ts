import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  // False inicial para no romper el ciclo en app.component, la animación inicial se controlará aparte de ser necesario
  public isLoading$ = new BehaviorSubject<boolean>(true); // Se inicia true para la primera carga

  show() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      // Usamos microtask para evitar el ExpressionChangedAfterItHasBeenCheckedError
      Promise.resolve().then(() => this.isLoading$.next(true)); 
    }
  }

  hide() {
    // Retraso defensivo por si hay peticiones secuenciales rápidas
    setTimeout(() => {
      this.activeRequests--;
      if (this.activeRequests <= 0) {
        this.activeRequests = 0;
        Promise.resolve().then(() => this.isLoading$.next(false));
      }
    }, 100);
  }
}
