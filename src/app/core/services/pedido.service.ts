import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../constants/environment';
import { Pedido } from '../../shared/models/pedido.model';
import { ResumenPedidos } from '../../shared/models/pedido-estadisticas.model';
import { EstadisticaPeriodo } from '../../shared/models/pedido-estadisticas.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiUrl}/pedidos`;
  private pedidosActualizados = new Subject<void>();

  pedidosActualizados$ = this.pedidosActualizados.asObservable();

  constructor(private http: HttpClient) {}

  notificarActualizacion(): void {
    this.pedidosActualizados.next();
  }

  getAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl);
  }

  getById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/${id}`);
  }

  getMisPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/mis-pedidos`);
  }

  updateEstado(id: number, idEstado: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.baseUrl}/${id}/estado`, { idEstado });
  }

  create(pedido: any): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, pedido);
  }

  marcarComoPagado(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.baseUrl}/${id}/pagar`, {});
  }

  exportarExcel(periodo: 'semana' | 'mes' | 'anio', fecha?: string): Observable<Blob> {
    let params = `periodo=${periodo}`;
    if (fecha) params += `&fecha=${fecha}`;

    return this.http.get(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob',
    });
  }

  getResumen(): Observable<ResumenPedidos> {
    return this.http.get<ResumenPedidos>(`${this.baseUrl}/estadisticas/resumen`);
  }

  getEstadisticasPorMes(): Observable<EstadisticaPeriodo[]> {
    return this.http.get<EstadisticaPeriodo[]>(`${this.baseUrl}/estadisticas/por-mes`);
  }

  getEstadisticasPorDia(): Observable<EstadisticaPeriodo[]> {
    return this.http.get<EstadisticaPeriodo[]>(`${this.baseUrl}/estadisticas/por-dia`);
  }
}
