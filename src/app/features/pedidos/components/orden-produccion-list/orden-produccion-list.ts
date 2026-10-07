import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { OrdenProduccionService } from '../../../../core/services/orden-produccion.service';
import {
  OrdenProduccion,
  MaterialFaltante,
} from '../../../../shared/models/orden-produccion.model';

@Component({
  selector: 'app-orden-produccion-list',
  standalone: true,
  imports: [PrimeImportsModule, FormsModule, DatePipe],
  templateUrl: './orden-produccion-list.html',
  styleUrl: './orden-produccion-list.css',
})
export class OrdenProduccionList {
  ordenes = signal<OrdenProduccion[]>([]);
  loading = signal(false);

  showFaltantes = signal(false);
  faltantes = signal<MaterialFaltante[]>([]);

  showFinalizar = signal(false);
  ordenSeleccionada = signal<OrdenProduccion | null>(null);
  producida = 0;
  merma = 0;
  observacion = '';
  guardando = signal(false);

  constructor(
    private ordenService: OrdenProduccionService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.ordenService.getAll().subscribe({
      next: (data) => {
        this.ordenes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de órdenes',
        });
      },
    });
  }

  iniciar(orden: OrdenProduccion): void {
    this.ordenService.validarMaterial(orden.id).subscribe({
      next: (faltantes) => {
        if (faltantes.length > 0) {
          this.faltantes.set(faltantes);
          this.showFaltantes.set(true);
          return;
        }
        this.ordenService.iniciar(orden.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Orden iniciada',
              detail: `Orden #${orden.id} en producción`,
            });
            this.load();
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo iniciar la orden',
            });
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo validar el material',
        });
      },
    });
  }

  abrirFinalizar(orden: OrdenProduccion): void {
    this.ordenSeleccionada.set(orden);
    this.producida = orden.cantidadProducida;
    this.merma = 0;
    this.observacion = '';
    this.showFinalizar.set(true);
  }

  confirmarFinalizar(): void {
    const orden = this.ordenSeleccionada();
    if (!orden) return;

    if (this.producida < 0 || this.merma < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos invalidos',
        detail: 'Las cantidades no pueden ser negativas',
      });
      return;
    }
    this.guardando.set(true);
    this.ordenService
      .finalizar(orden.id, {
        cantidadProducida: this.producida,
        cantidadMerma: this.merma,
        observacion: this.observacion,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.showFinalizar.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Orden finalizada',
            detail: `Orden #${orden.id} finalizada. Material descontado.`,
          });
          this.load();
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar la orden',
          });
        },
      });
  }

  severity(nombre: string): 'warn' | 'info' | 'success' | 'danger' | 'secondary' {
    switch (nombre) {
      case 'PENDIENTE': return 'warn';
      case 'EN_PRODUCCION': return 'info';
      case 'FINALIZADA': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'secondary';
    }
  }
}
