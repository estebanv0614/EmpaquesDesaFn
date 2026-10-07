import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { Material } from '../../shared/models/material.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
    private baseUrl = `${environment.apiUrl}/materials`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Material[]>{
        return this.http.get<Material[]>(this.baseUrl);
    }

    getById(id: number): Observable<Material>{
        return this.http.get<Material>(`${this.baseUrl}/${id}`);
    }

    create(material: any): Observable<Material>{
        return this.http.post<Material>(this.baseUrl, material);
    }

    delete(id: number): Observable<void>{
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}