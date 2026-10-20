import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '../constants/environment';
import { UserService } from './user-service';

@Injectable({providedIn: 'root'})
export class Auth {
  private tokenKey = 'auth_token';
  private usernameKey = 'auth_username';
  private rolesKey = 'auth_roles';

  isLoggedIn = signal<boolean>(this.hasToken());
  username = signal<string | null>(localStorage.getItem(this.usernameKey));
  roles = signal<string[]>(JSON.parse(localStorage.getItem(this.rolesKey) || '[]'));

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.usernameKey, username);
          this.isLoggedIn.set(true);
          this.username.set(username);
        }),
        switchMap(() => this.userService.getMe()),
        tap(user => {
          const roleNames = user.roles.map(r => r.rol);
          localStorage.setItem(this.rolesKey, JSON.stringify(roleNames));
          this.roles.set(roleNames);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.rolesKey);
    this.isLoggedIn.set(false);
    this.username.set(null);
    this.roles.set([]);
  }

  /** Devuelve el token solo si existe y NO ha vencido */
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token || this.isExpired(token)) {
      return null;
    }
    return token;
  }

  /**
   * Revisa si la sesión sigue vigente. Si el token venció, cierra la sesión
   * (borra token, usuario y roles) para que la app no crea que sigue logueada.
   */
  sessionValid(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (token && this.isExpired(token)) {
      this.logout();
    }
    return this.isLoggedIn();
  }

  isCliente(): boolean {
    return this.roles().includes('CLIENTE');
  }

  isAdmin(): boolean {
    return this.roles().includes('ADMIN') || this.roles().includes('USER');
  }

  private hasToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token && !this.isExpired(token);
  }

  /** Lee el campo "exp" (segundos) del JWT. Si no se puede leer, NO se considera vencido. */
  private isExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const exp = JSON.parse(json).exp;
      return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
      return false;
    }
  }
}
