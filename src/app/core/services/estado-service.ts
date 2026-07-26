import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { Estado } from '../../shared/models/estado.model';

@Injectable({ providedIn: 'root' })
export class EstadoService {
  private baseUrl = `${environment.apiUrl}/estado`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.baseUrl);
  }
}