import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map } from "rxjs";
import { SolicitudCotizacionService } from "./core/services/solicitud-cotizacion.service";

export const convertirSolicitudGuard: CanActivateFn = (route) => {
    const solicitudService = inject(SolicitudCotizacionService);
    const router = inject(Router);
    const id = Number(route.paramMap.get('id'));

    return solicitudService.getById(id).pipe(
        map((solicitud) => {
            if (solicitud.documentoComercialId) {
                return router.createUrlTree(['/solicitudes-cotizacion']);
            }
            return true;
        })
    );
};