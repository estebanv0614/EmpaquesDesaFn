import { GastoOperativo } from './gasto-operativo.model';
import { Material } from './material.model';
import { OrdenProduccion } from './orden-produccion.model';
import { User } from './documento-comercial.model';

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'PRODUCCION';

export interface MovimientoInventario {
  id: number;
  gastoOperativo: GastoOperativo;
  costoUnitario?: number;
  material: Material;
  ordenProduccion: OrdenProduccion;
  user: User;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  fechaMovimiento: string;
  referencia?: string;
  observacion?: string;
}
