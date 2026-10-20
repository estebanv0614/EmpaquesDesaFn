import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { environment } from '../constants/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // El token SOLO se envía a nuestro backend, nunca a sitios externos
  // (YouTube, fuentes, etc.), para no filtrarlo.
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const authService = inject(Auth);
  const token = authService.getToken(); // null si no hay o si ya venció

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }
  return next(req);
};
