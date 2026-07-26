
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { DocumentoComercial } from '../../shared/models/documento-comercial.model';

@Injectable({ providedIn: 'root' })
export class DocumentoComercialService {
  private baseUrl = `${environment.apiUrl}/documentos-comerciales`;

  constructor(private http: HttpClient) {}

  create(dto: DocumentoComercial): Observable<DocumentoComercial> {
    return this.http.post<DocumentoComercial>(this.baseUrl, dto);
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}