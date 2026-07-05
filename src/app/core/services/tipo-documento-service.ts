import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { TipoDocumento } from '../../shared/models/tipo-documento.model';

@Injectable({
  providedIn: 'root',
})
export class TipoDocumentoService {
  private baseUrl = `${environment.apiUrl}/document-types`;

  constructor(private http: HttpClient){}

  getAll(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(this.baseUrl);
  }
}
