import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import {
  OrdenProduccion,
  MaterialFaltante,
  FinalizarOrdenRequest,ConsumoSugerido
} from '../../shared/models/orden-produccion.model';

@Injectable({ providedIn: 'root' })
export class OrdenProduccionService {
  private baseUrl = `${environment.apiUrl}/ordenes-produccion`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrdenProduccion[]> {
    return this.http.get<OrdenProduccion[]>(this.baseUrl);
  }

  validarMaterial(id: number): Observable<MaterialFaltante[]> {
    return this.http.get<MaterialFaltante[]>(`${this.baseUrl}/${id}/validar-material`);
  }

  consumoSugerido(id: number, producida: number, merma: number): Observable<ConsumoSugerido[]> {
    const params = new HttpParams().set('producida', producida).set('merma', merma);
    return this.http.get<ConsumoSugerido[]>(`${this.baseUrl}/${id}/consumo-sugerido`, { params });
  }

  iniciar(id: number): Observable<OrdenProduccion> {
    return this.http.patch<OrdenProduccion>(`${this.baseUrl}/${id}/iniciar`, {});
  }

  finalizar(id: number, body: FinalizarOrdenRequest): Observable<OrdenProduccion> {
    return this.http.patch<OrdenProduccion>(`${this.baseUrl}/${id}/finalizar`, body);
  }
}
