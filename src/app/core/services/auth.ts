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

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isCliente(): boolean {
    return this.roles().includes('CLIENTE');
  }

  isAdmin(): boolean {
    return this.roles().includes('ADMIN') || this.roles().includes('USER');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
