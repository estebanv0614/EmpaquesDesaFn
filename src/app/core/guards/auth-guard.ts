import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

/** Exige sesión iniciada y vigente (si el token venció, cierra la sesión). */
export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.sessionValid()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

/**
 * Exige sesión vigente Y rol de administrador/empleado (ADMIN o USER).
 * Un cliente que escriba la URL a mano es devuelto al inicio.
 * OJO: esto solo mejora la experiencia; la seguridad real debe validarse en el backend.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.sessionValid()) {
    router.navigate(['/login']);
    return false;
  }
  if (authService.isAdmin()) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};
