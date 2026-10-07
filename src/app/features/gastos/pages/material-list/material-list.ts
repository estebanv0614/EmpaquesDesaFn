import { Component, OnInit, signal } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MaterialService } from '../../../../core/services/material.service';
import { Material } from '../../../../shared/models/material.model';


@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [PrimeImportsModule],
  templateUrl: './material-list.html',
  styleUrl: './material-list.css',
})
export class MaterialList implements OnInit {
  materials = signal<Material[]>([]);
  loading = signal<boolean>(false);

  showForm = false;
  selectedMaterial: Material | null = null;

  constructor(
    private materialService: MaterialService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.listMaterial();
  }

  listMaterial(): void {
    this.loading.set(true);
    this.materialService.getAll().subscribe({
      next: (data) => {
        this.materials.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de materiales',
        });
      },
    });
  }

  createMaterial(): void {
    this.selectedMaterial = null;
    this.showForm = true;
  }

  editMaterial(material: Material): void {
    this.selectedMaterial = material;
    this.showForm = true;
  }

  onFormClosed(saved: boolean): void {
    this.showForm = false;
    if (saved) {
      this.listMaterial();
    }
  }

  confirmDelete(material: Material): void {
      this.confirmationService.confirm({
        message: `¿Seguro que deseas eliminar a "${material.name}"?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        accept: () => this.deleteMaterial(material.id)
      });
    }

    deleteMaterial(id: number): void {
    this.materialService.delete(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Material eliminado correctamente' });
        this.listMaterial();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
      }
    });
  }
}
