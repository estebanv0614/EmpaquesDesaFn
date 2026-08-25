import { Component, OnInit, signal, computed } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SolicitudCotizacionService } from '../../../../core/services/solicitud-cotizacion.service';
import { SolicitudCotizacionResponse } from '../../../../shared/models/solicitud-cotizacion-request.model';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-solicitud-list',
  standalone: true,
  imports: [PrimeImportsModule, DatePipe, FormsModule],
  templateUrl: './solicitud-list.html',
  styleUrl: './solicitud-list.css',
})
export class SolicitudList implements OnInit {
  solicitudes = signal<SolicitudCotizacionResponse[]>([]);
  loading = signal<boolean>(false);

  selectedSolicitud = signal<SolicitudCotizacionResponse | null>(null);
  showDetalle = signal(false);

  // Filtro por rango de fechas
  fechaDesde = signal<Date | null>(null);
  fechaHasta = signal<Date | null>(null);

  solicitudesFiltradas = computed(() => {
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();
    if (!desde && !hasta) return this.solicitudes();

    return this.solicitudes().filter((s) => {
      const fecha = new Date(s.fechaSolicitud);
      if (desde) {
        const inicioDia = new Date(desde);
        inicioDia.setHours(0, 0, 0, 0);
        if (fecha < inicioDia) return false;
      }
      if (hasta) {
        const finDia = new Date(hasta);
        finDia.setHours(23, 59, 59, 999);
        if (fecha > finDia) return false;
      }
      return true;
    });
  });

  readonly ESTADO_PENDIENTE = 2;
  readonly ESTADO_APROBADA = 3;
  readonly ESTADO_RECHAZADA = 4;

  constructor(
    private solicitudService: SolicitudCotizacionService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  irAConvertir(id: number): void {
    this.router.navigate(['/solicitudes-cotizacion', id, 'convertir']);
  }

  limpiarFiltroFecha(): void {
    this.fechaDesde.set(null);
    this.fechaHasta.set(null);
  }

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.loading.set(true);
    this.solicitudService.getAll().subscribe({
      next: (date) => {
        this.solicitudes.set(date);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de solicitudes',
        });
      },
    });
  }

  verDetalle(solicitud: SolicitudCotizacionResponse): void {
    this.selectedSolicitud.set(solicitud);
    this.showDetalle.set(true);
  }

  cerrarDetalle(): void {
    this.showDetalle.set(false);
    this.selectedSolicitud.set(null);
  }

  confirmarCambioEstado(
    solicitud: SolicitudCotizacionResponse,
    idEstado: number,
    etiqueta: string,
  ): void {
    this.confirmationService.confirm({
      message: `¿Marcar la solicitud de "${solicitud.name}" como "${etiqueta}"?`,
      header: 'Confirmar acción',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, confirmar',
      rejectLabel: 'Cancelar',
      accept: () => this.cambiarEstado(solicitud.id, idEstado),
    });
  }

  cambiarEstado(id: number, idEstado: number): void {
    this.solicitudService.updateEstado(id, idEstado).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Estado actualizado correctamente',
        });
        this.loadSolicitudes();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado',
        });
      },
    });
  }

  severityEstado(idEstado: number): 'warn' | 'success' | 'danger' | 'secondary' {
    if (idEstado === this.ESTADO_PENDIENTE) return 'warn';
    if (idEstado === this.ESTADO_APROBADA) return 'success';
    if (idEstado === this.ESTADO_RECHAZADA) return 'danger';
    return 'secondary';
  }
}
