import { Estado } from "./estado.model";

export interface Bolsa {
    id: number;
    name: string;
    description: string;
    tipo: string;
    anchoCm: number;
    largoCm: number;
    calibre: number;
    precioBase: number;
    imagenUrl?: string;
    estado: Estado
}