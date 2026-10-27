// core/services/user-service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { User, UserCreateRequest } from '../../shared/models/user.model';
import { Rol } from '../../shared/models/rol.model';

export interface CurrentUser {
  id: number;
  username: string;
  person?: { id: number; name: string };
  roles: Rol[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.baseUrl}/me`);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  create(user: UserCreateRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }
}
