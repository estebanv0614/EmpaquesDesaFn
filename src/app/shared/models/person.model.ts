import { TipoDocumento } from "./tipo-documento.model";
export interface Person {
    id: number;
    tipoDocumento: TipoDocumento;
    documentNumber: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}
