import { DetalleSolicitud } from "./detalle-solicitud.model";

export interface SolicitudCotizacionRequest {
    name: string;
    phone?: string;
    mail?: string;
    city?: string;
    address?: string;
    observacion?: string;
    detalles: DetalleSolicitud[];
}

export interface SolicitudCotizacionResponse extends SolicitudCotizacionRequest {
    id: number;
    fechaSolicitud: string;
    estado: {
        id: number;
        name: string;
    }
}