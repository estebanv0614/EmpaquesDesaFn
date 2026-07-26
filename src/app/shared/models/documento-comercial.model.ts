import { Client } from "./client.model";
import { DetalleDocumento } from "./detalle-documento.model";
import { Estado } from "./estado.model";
import { MetodoPago } from "./metodo-pago.model";
import { TipoDocumento } from "./tipo-documento.model";

export interface User {
  id: number;
}

export interface DocumentoComercial {
    id?: number;
    numeroFactura: string;
    tipoDocumento: TipoDocumento;
    client: Client;
    user: User;
    fechaEmision: string;
    subtotal: number;
    iva: number;
    total: number;
    metodoPago: MetodoPago;
    estado: Estado;
    referenciaCotizacionId?: number;
    observaciones?: string;
    detalles: DetalleDocumento[];
}