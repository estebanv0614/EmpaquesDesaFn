import { Bolsa } from "./bolsa.model";

export interface DetalleDocumento {
    id?: number;
    idDocumento?: number;
    bolsa: Bolsa;
    cantidad: number;
    precioUnitarioSnapshot: number;
    subtotal: number;
}