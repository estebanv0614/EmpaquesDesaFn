import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import {
  SolicitudCotizacionRequest,
  SolicitudCotizacionResponse,
} from '../../shared/models/solicitud-cotizacion-request.model';
import { DocumentoComercial } from '../../shared/models/documento-comercial.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitudCotizacionService {
  private baseUrl = `${environment.apiUrl}/solicitudes-cotizacion`;

  constructor(private http: HttpClient) {}

  create(solicitud: SolicitudCotizacionRequest): Observable<SolicitudCotizacionResponse> {
    return this.http.post<SolicitudCotizacionResponse>(this.baseUrl, solicitud);
  }

  getAll(): Observable<SolicitudCotizacionResponse[]> {
    return this.http.get<SolicitudCotizacionResponse[]>(this.baseUrl);
  }

  updateEstado(id: number, idEstado: number): Observable<SolicitudCotizacionResponse> {
    return this.http.patch<SolicitudCotizacionResponse>(`${this.baseUrl}/${id}/estado`, {
      idEstado,
    });
  }

  getById(id: number): Observable<SolicitudCotizacionResponse> {
    return this.http.get<SolicitudCotizacionResponse>(`${this.baseUrl}/${id}`);
  }

  convertir(id: number, dto: DocumentoComercial): Observable<DocumentoComercial> {
    return this.http.post<DocumentoComercial>(`${this.baseUrl}/${id}/convertir`, dto);
  }
}
