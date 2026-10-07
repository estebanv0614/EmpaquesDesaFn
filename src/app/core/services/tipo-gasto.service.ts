import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { TipoGasto } from '../../shared/models/tipo-gasto';

@Injectable({ providedIn: 'root' })
export class TipoGastoService {
    private baseUrl = `${environment.apiUrl}/tipo-gasto`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<TipoGasto[]> {
        return this.http.get<TipoGasto[]>(this.baseUrl);
    }
}