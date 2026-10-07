import { Empleado } from './empleado.model';
import { Material } from './material.model';
import { MetodoPago } from './metodo-pago.model';
import { TipoGasto } from './tipo-gasto';

export interface GastoOperativo {
  id: number;
  tipoGasto: TipoGasto;
  monto: number;
  fechaGasto: string;
  descripcion: string;
  metodoPago: MetodoPago;
  adminResponsable: Empleado;
  evidenciaUrl?: string | null;
  material: Material;
  cantidad: number | null;
}
