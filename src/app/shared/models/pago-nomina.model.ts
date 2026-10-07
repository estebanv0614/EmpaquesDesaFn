import { Empleado } from './empleado.model';
import { MetodoPago } from './metodo-pago.model';

export interface PagoNomina {
  id: number;
  empleado: Empleado;
  fechaInicio: string;
  fechaFin: string;
  salarioBase: number;
  bonificaciones: number;
  deducciones: number;
  totalPagar: number;
  pagado: boolean;
  fechaPago?: string | null;
  metodoPago: MetodoPago;
  observacion?: string | null;
}
