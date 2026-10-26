import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MovimientoInventarioService } from '../../../../core/services/movimiento-inventario.service';
import { MovimientoInventario, TipoMovimiento } from '../../../../shared/models/movimiento-inventario.model';

@Component({
  selector: 'app-movimiento-list',
  imports: [PrimeImportsModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './movimiento-list.html',
  styleUrl: './movimiento-list.css',
})
export class MovimientoList implements OnInit {
  movimiento = signal<MovimientoInventario[]>([]);
  loading = signal(false);
  tipoFiltro = signal<TipoMovimiento | null>(null);

  tipos: { label: string; value: TipoMovimiento }[] = [
    { label: 'Entrada', value: 'ENTRADA' },
    { label: 'Producción', value: 'PRODUCCION' },
    { label: 'Salida', value: 'SALIDA' },
    { label: 'Ajuste', value: 'AJUSTE' },
  ];

  movimientoFiltrado = computed(() => {
    const tipo = this.tipoFiltro();
    const lista = this.movimiento();
    return tipo ? lista.filter((m) => m.tipoMovimiento === tipo) : lista;
  });

  constructor(
    private movimientoService: MovimientoInventarioService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.movimientoService.getAll().subscribe({
      next: (data) => {
        const ordenados = [...data].sort((a, b) =>
        b.fechaMovimiento.localeCompare(a.fechaMovimiento),);
        this.movimiento.set(ordenados);
        this.loading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el historial de movimientos',
        });
      },
    });
  }

  severity(tipo: TipoMovimiento): 'success' | 'info' | 'warn' | 'secondary' {
    switch (tipo) {
      case 'ENTRADA': return 'success';
      case 'PRODUCCION': return 'info';
      case 'SALIDA': return 'warn';
      default: return 'secondary';
    }
  }
}
