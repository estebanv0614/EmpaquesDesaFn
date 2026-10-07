import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Empleado } from '../../../../shared/models/empleado.model';
import { EmpleadoForm } from '../empleado-form/empleado-form';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [PrimeImportsModule, CurrencyPipe, DatePipe, EmpleadoForm],
  templateUrl: './empleado-list.html',
  styleUrl: './empleado-list.css',
})
export class EmpleadoList  implements OnInit {
  empleados = signal<Empleado[]>([]);
  loading = signal(false);
  showForm = signal(false);
  selected = signal<Empleado | null>(null);

  constructor(
    private service: EmployeeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (d) => { this.empleados.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar' }); },
    });
  }

  openCreate(): void { this.selected.set(null); this.showForm.set(true); }
  openEdit(e: Empleado): void { this.selected.set(e); this.showForm.set(true); }

  onFormClosed(saved: boolean): void {
    this.showForm.set(false);
    if (saved) this.load();
  }

  confirmDelete(e: Empleado): void {
    this.confirmationService.confirm({
      message: `¿Eliminar al empleado "${e.person?.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.service.delete(e.id).subscribe({
        next: () => { this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Empleado eliminado' }); this.load(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }),
      }),
    });
  }
}
