import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  public isLoading$ = new BehaviorSubject<boolean>(true);

  show() {
    this.isLoading$.next(true);
  }

  hide() {
    // Un pequeño respiro de tiempo para que la vista se acomode totalmente antes de quitar la carga
    setTimeout(() => {
      this.isLoading$.next(false);
    }, 400);
  }
}
