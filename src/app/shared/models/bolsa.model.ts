import { Estado } from "./estado.model";

export interface Bolsa {
    id: number;
    tipo: string;
    anchoCm: number;
    largoCm: number;
    calibre: number;
    precioBase: number;
    stockActual: number;
    estado: Estado
}