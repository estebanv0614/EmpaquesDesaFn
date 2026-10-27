import { Estado } from "./estado.model";
import { Person } from "./person.model";

export type TipoCliente = 'DETAL' | 'MAYORISTA';

export interface Client {
    id: number;
    person: Person;
    empresa?: string;
    estado: Estado;
    tipoCliente?: TipoCliente;
    ciudad?: string;
    direccionEntrega?: string;
    observaciones?: string;
}