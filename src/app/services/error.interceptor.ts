import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // No redirigir en errores de búsqueda (sugerencias) — el componente maneja el error
  if (req.url.includes('/search') || req.url.includes('/suggestions')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      router.navigate(['/error']);
      return throwError(() => error);
    })
  );
};
