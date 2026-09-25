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

    getPublicoCatalogo(): Observable<Bolsa[]> {
        return this.http.get<Bolsa[]>(`${this.baseUrl}/catalogo`);
    }

    create(formData: FormData): Observable<Bolsa> {
        return this.http.post<Bolsa>(this.baseUrl, formData);
    }

    update(id: number, formData: FormData): Observable<Bolsa> {
        return this.http.put<Bolsa>(`${this.baseUrl}/${id}`, formData);
    }

    detele(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    getImagenUrl(imagenUrl?: string): string {
    if (!imagenUrl) {
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#f3f4f6"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="10">
                    Sin imagen
                </text>
            </svg>
        `);
    }
    return `${environment.apiUrl}${imagenUrl}`;
}
}