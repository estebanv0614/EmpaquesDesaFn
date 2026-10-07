import { Estado } from './estado.model';
import { DetallePedido } from './pedido.model';
import { User } from './user.model';

export interface OrdenProduccion {
  id: number;
  detallePedido: DetallePedido;
  user: User;
  cantidadProducida: number;
  cantidadMerma: number;
  fechaProduccion?: string;
  fechaFin?: string;
  observacion?: string;
  estado: Estado;
  numeroPedido?: string;
  cantidadProducir: number;
}

export interface MaterialFaltante {
  idMaterial: number;
  nombre: string;
  requerido: number;
  disponible: number;
  faltante: number;
}

export interface FinalizarOrdenRequest {
  cantidadProducida: number;
  cantidadMerma: number;
  observacion: string;
}
