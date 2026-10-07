import { Component, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GastoOperativoService } from '../../../../core/services/gasto-operativo.service';
import { GastoOperativo } from '../../../../shared/models/gasto-operativo.model';
import { GastosForm } from '../gastos-form/gastos-form';

@Component({
  selector: 'app-gastos-list',
  standalone: true,
  imports: [PrimeImportsModule, CurrencyPipe, DatePipe, GastosForm],
  templateUrl: './gastos-list.html',
  styleUrl: './gastos-list.css',
})
export class GastosList {
  gastos = signal<GastoOperativo[]>([]);
  loading = signal(false);
  showForm = signal(false);

  totalGastos = computed(() => this.gastos().reduce((acc, g) => acc + g.monto, 0));

  constructor(
    private service: GastoOperativoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.gastos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los gastos',
        });
      },
    });
  }

  onFormClosed(saved: boolean): void {
    this.showForm.set(false);
    if (saved) this.load();
  }

  confirmDelete(g: GastoOperativo): void {
    this.confirmationService.confirm({
      message:
        '¿Eliminar este gasto? Si fue una compra de material, el stock NO se revierte automáticamente.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () =>
        this.service.delete(g.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: 'Gasto eliminado',
            });
            this.load();
          },
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar',
            }),
        }),
    });
  }

  evidencia(g: GastoOperativo): string | null {
    return this.service.getEvidenciaUrl(g.evidenciaUrl);
  }
}
