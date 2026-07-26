import { Component, computed, OnInit, signal } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BolsaForm } from '../bolsa-form/bolsa-form';

@Component({
  selector: 'app-bolsa-list',
  standalone: true,
  imports: [PrimeImportsModule, CurrencyPipe, FormsModule, BolsaForm],
  templateUrl: './bolsa-list.html',
  styleUrl: './bolsa-list.css',
})
export class BolsaList {
  bolsas = signal<Bolsa[]>([]);
  loading = signal(false);
  searchTerm = signal('');

  showForm = signal(false);
  selectedBolsa = signal<Bolsa | null>(null);

  filteredBolsa = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if(!term) return this.bolsas();

    return this.bolsas().filter(b => 
      String(b.id).includes(term) || 
      b.tipo?.toLowerCase().includes(term)
    );
  })

  constructor(
    private bolsaService: BolsaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadBolsas();
  }

  loadBolsas(): void {
    this.loading.set(true);
    this.bolsaService.getAll().subscribe({
      next: (data) => {
        this.bolsas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de bolsas' });
      }
    });
  }

  openCreate(): void {
    this.selectedBolsa.set(null);
    this.showForm.set(true);
  }

  openEdit(bolsa: Bolsa): void {
    this.selectedBolsa.set(bolsa);
    this.showForm.set(true);
  }

  onFormClosed(saved: boolean): void {
    this.showForm.set(false);
    if(saved) {
      this.loadBolsas();
    }
  }

  confirmDelete(bolsa: Bolsa): void {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar la bolsa "${bolsa.tipo}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteBolsa(bolsa.id),
    });
  }

  deleteBolsa(id: number): void {
    this.bolsaService.detele(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'Bolsa eliminada correctamente' });
        this.loadBolsas();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
      }
    });
  }
}
