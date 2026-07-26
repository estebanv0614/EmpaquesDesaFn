import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { Bolsa } from '../../shared/models/bolsa.model';

@Injectable({ providedIn: 'root' })
export class BolsaService {
    private baseUrl = `${environment.apiUrl}/bolsas`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Bolsa[]> {
        return this.http.get<Bolsa[]>(this.baseUrl);
    }

    getById(id: number): Observable<Bolsa> {
        return this.http.get<Bolsa>(`${this.baseUrl}/${id}`);
    }

    create(bolsa: Bolsa): Observable<Bolsa> {
        return this.http.post<Bolsa>(this.baseUrl, bolsa);
    }

    update(id: number, bolsa: Bolsa): Observable<Bolsa> {
        return this.http.put<Bolsa>(`${this.baseUrl}/${id}`, bolsa);
    }

    detele(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}