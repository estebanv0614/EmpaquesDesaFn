import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { MovimientoInventario } from '../../shared/models/movimiento-inventario.model';

@Injectable({ providedIn: 'root' })
export class MovimientoInventarioService {
    private baseUrl = `${environment.apiUrl}/movimientos-inventario`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<MovimientoInventario[]> {
        return this.http.get<MovimientoInventario[]>(this.baseUrl);
    }

}