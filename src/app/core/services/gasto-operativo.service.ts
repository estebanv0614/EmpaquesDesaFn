import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { GastoOperativo } from '../../shared/models/gasto-operativo.model';

@Injectable({ providedIn: 'root' })
export class GastoOperativoService {
  private baseUrl = `${environment.apiUrl}/gastos-operativos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<GastoOperativo[]> {
    return this.http.get<GastoOperativo[]>(this.baseUrl);
  }

  create(formData: FormData): Observable<GastoOperativo[]> {
    return this.http.post<GastoOperativo[]>(this.baseUrl, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getEvidenciaUrl(url?: string | null): string | null {
    return url ? `${environment.apiUrl}${url}` : null;
  }
}
