import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { MetodoPago } from '../../shared/models/metodo-pago.model';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private baseUrl = `${environment.apiUrl}/metodo-pago`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(this.baseUrl);
  }
}