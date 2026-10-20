import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { environment } from '../constants/environment';

/**
 * Reacciona a errores de seguridad que devuelve el backend:
 *  - 401: la sesión no es válida o venció -> cierra sesión y manda al login.
 *  - 403: no tiene permiso para esa acción -> avisa y lo devuelve al inicio.
 * Se ignora el endpoint de login (ahí un 401 es solo "credenciales incorrectas").
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const messages = inject(MessageService);

  const esBackend = req.url.startsWith(environment.apiUrl);
  const esLogin = req.url.includes('/auth/login');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (esBackend && !esLogin) {
        if (error.status === 401) {
          const teniaSesion = auth.isLoggedIn();
          auth.logout();
          if (teniaSesion) {
            messages.add({
              severity: 'warn',
              summary: 'Sesión expirada',
              detail: 'Por seguridad, inicia sesión de nuevo.',
            });
          }
          router.navigate(['/login']);
        } else if (error.status === 403) {
          messages.add({
            severity: 'error',
            summary: 'Sin permiso',
            detail: 'No tienes permiso para realizar esta acción.',
          });
        }
      }
      return throwError(() => error);
    }),
  );
};
