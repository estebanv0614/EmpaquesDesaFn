import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { OrdenProduccionService } from '../../../../core/services/orden-produccion.service';
import { MaterialService } from '../../../../core/services/material.service';
import { Material } from '../../../../shared/models/material.model';
import {
  OrdenProduccion,
  MaterialFaltante,
} from '../../../../shared/models/orden-produccion.model';

interface FilaConsumo {
  idMaterial: number | null;
  nombre: string;
  unidadMedida: string;
  porUnidad: number;
  cantidad: number;
  editada: boolean;
  tipo: 'fijo' | 'tinta' | 'extra';
}

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

  materiales = signal<Material[]>([]);
  tintas = computed(() =>
    this.materiales().filter((m) => (m.name ?? '').trim().toUpperCase().startsWith('TINTA')),
  );
  consumos: FilaConsumo[] = [];
  cargandoConsumo = signal(false);

  constructor(
    private ordenService: OrdenProduccionService,
    private messageService: MessageService,
    private materialService: MaterialService,
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
              detail: err.error?.message ?? 'No se pudo iniciar la orden',
            });
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'No se pudo validar el material',
        });
      },
    });
  }

  abrirFinalizar(orden: OrdenProduccion): void {
    this.ordenSeleccionada.set(orden);
    this.producida = orden.cantidadProducir;
    this.merma = 0;
    this.observacion = '';
    this.consumos = [];
    this.showFinalizar.set(true);

    this.materialService.getAll().subscribe({
      next: (m) => this.materiales.set(m),
      error: (err) => console.error(err),
    });

    this.cargandoConsumo.set(true);
    this.ordenService.consumoSugerido(orden.id, 1, 0).subscribe({
      next: (lista) => {
        this.consumos = lista.map((c) => ({
          idMaterial: c.idMaterial,
          nombre: c.nombre,
          unidadMedida: c.unidadMedida,
          porUnidad: c.cantidad,
          cantidad: 0,
          editada: false,
          tipo: 'fijo',
        }));

        this.materialService.getAll().subscribe({
          next: (m) => {
            this.materiales.set(m);
            for (const f of this.consumos) {
              if (this.esTinta(f.idMaterial)) f.tipo = 'tinta';
            }
            this.recalcular();
            this.cargandoConsumo.set(false);
          },
          error: () => {
            this.recalcular();
            this.cargandoConsumo.set(false);
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.cargandoConsumo.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la receta de la orden',
        });
      },
    });
  }

  recalcular(): void {
    const total = (this.producida || 0) + (this.merma || 0);
    for (const f of this.consumos) {
      if (f.tipo !== 'extra' && !f.editada) {
        f.cantidad = this.redondear(f.porUnidad * total);
      }
    }
  }

  onProducida(v: number): void {
    this.producida = v;
    this.recalcular();
  }

  onMerma(v: number): void {
    this.merma = v;
    this.recalcular();
  }

  cambiarMaterial(fila: FilaConsumo, idMaterial: number | null): void {
    const m = this.materiales().find((x) => x.id === idMaterial);
    fila.idMaterial = idMaterial;
    fila.nombre = m?.name ?? '';
    fila.unidadMedida = m?.unidadMedida ?? '';
  }

  agregarMaterial(): void {
    this.consumos.push({
      idMaterial: null,
      nombre: '',
      unidadMedida: '',
      porUnidad: 0,
      cantidad: 0,
      editada: true,
      tipo: 'extra',
    });
  }

  quitarFila(index: number): void {
    this.consumos.splice(index, 1);
  }

  opciones(fila: FilaConsumo): Material[] {
    return fila.tipo === 'tinta' ? this.tintas() : this.materiales();
  }

  stockDe(idMaterial: number | null): number | null {
    const m = this.materiales().find((x) => x.id === idMaterial);
    return m ? m.stockActual : null;
  }

  sinStock(fila: FilaConsumo): boolean {
    const stock = this.stockDe(fila.idMaterial);
    return stock !== null && fila.cantidad > stock;
  }

  confirmarFinalizar(): void {
    const orden = this.ordenSeleccionada();
    if (!orden) return;

    if (this.producida < 0 || this.merma < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos inválidos',
        detail: 'Las cantidades no pueden ser negativas',
      });
      return;
    }

    const consumos = this.consumos
      .filter((f) => f.idMaterial !== null && f.cantidad > 0)
      .map((f) => ({ idMaterial: f.idMaterial as number, cantidad: f.cantidad }));

    if (consumos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin materiales',
        detail: 'Indica al menos un material con su cantidad',
      });
      return;
    }
    if (this.consumos.some((f) => f.idMaterial === null)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Material sin elegir',
        detail: 'Hay una fila sin material; elígelo o quítala',
      });
      return;
    }

    this.guardando.set(true);
    this.ordenService
      .finalizar(orden.id, {
        cantidadProducida: this.producida,
        cantidadMerma: this.merma,
        observacion: this.observacion,
        consumos,
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
            detail: err.error?.message ?? 'No se pudo finalizar la orden',
          });
        },
      });
  }

  private esTinta(idMaterial: number | null): boolean {
    const m = this.materiales().find((x) => x.id === idMaterial);
    return (m?.categoria ?? '').trim().toUpperCase() === 'TINTA';
  }

  private redondear(n: number): number {
    return Math.round(n * 10000) / 10000;
  }

  severity(nombre: string): 'warn' | 'info' | 'success' | 'danger' | 'secondary' {
    switch (nombre) {
      case 'PENDIENTE':
        return 'warn';
      case 'EN_PRODUCCION':
        return 'info';
      case 'FINALIZADA':
        return 'success';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
