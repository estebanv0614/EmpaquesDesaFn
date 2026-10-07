import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { PagoNomina } from '../../shared/models/pago-nomina.model';

@Injectable({ providedIn: 'root' })
export class NominaService {
  private baseUrl = `${environment.apiUrl}/nomina`;

  constructor(private http: HttpClient) {}

  listar(fechaIso: string): Observable<PagoNomina[]> {
    return this.http.get<PagoNomina[]>(`${this.baseUrl}?fecha=${fechaIso}`);
  }

  generar(fechaIso: string): Observable<PagoNomina[]> {
    return this.http.post<PagoNomina[]>(`${this.baseUrl}/generar?fecha=${fechaIso}`, {});
  }

  actualizar(
    id: number,
    body: { bonificaciones: number; deducciones: number; observacion?: string },
  ): Observable<PagoNomina> {
    return this.http.put<PagoNomina>(`${this.baseUrl}/${id}`, body);
  }

  pagar(id: number, formData: FormData): Observable<PagoNomina> {
    return this.http.patch<PagoNomina>(`${this.baseUrl}/${id}/pagar`, formData);
  }
}
