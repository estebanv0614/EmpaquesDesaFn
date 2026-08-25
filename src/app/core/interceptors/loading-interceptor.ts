import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// Muestra un indicador de carga mientras hay peticiones en curso y detecta
// cuando el backend esta caido y ps no  responde (servidor caído / sin conexión) para mostrar
// una pantalla de error y no dejar la app en blanco.
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    tap(() => loadingService.setServerDown(false)),
    catchError((error: HttpErrorResponse) => {
      // status 0 = no hubo respuesta del servidor caído, sin red, CORS.
      if (error.status === 0) {
        loadingService.setServerDown(true);
      }
      return throwError(() => error);
    }),
    finalize(() => loadingService.hide()),
  );
};
