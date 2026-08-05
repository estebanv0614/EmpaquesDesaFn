import { Bolsa } from "./bolsa.model";
import { Client } from "./client.model";
import { Estado } from "./estado.model";
import { MetodoPago } from "./metodo-pago.model";

export interface DetallePedido {
  id?: number;
  bolsa: Bolsa;
  cantidad: number;
  precioUnitarioVenta: number;
  subtotalLinea: number;
}

export interface Pedido {
    id: number;
    numeroPedido: string;
    client: Client;
    userVendedor: { id: number; username?: string };
    estado: Estado;
    fechaPedido: string;
    fechaEntregaEstimada?: string;
    subtotal: number;
    impuesto: number;
    total: number;
    metodoPago?: MetodoPago;
    observacion?: string;
    detalles: DetallePedido[];
}