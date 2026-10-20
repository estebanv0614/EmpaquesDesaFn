import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { MaterialService } from '../../../../core/services/material.service';
import { Material } from '../../../../shared/models/material.model';

@Component({
  selector: 'app-material-form',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './material-form.html',
  styleUrl: './material-form.css',
})
export class MaterialForm implements OnInit {
  @Input() material: Material | null = null;
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;
  isEditMode = false;
  materials = signal<Material[]>([]);

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      unidadMedida: ['', Validators.required],
      categoria: ['',],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    if (this.material) {
      this.isEditMode = true;
      this.form.patchValue(this.material);
      this.form.get('stockActual')?.disable();
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = { ...this.form.getRawValue(), stockActual: this.material?.stockActual ?? 0 } as Material;
    const request = this.isEditMode
      ? this.materialService.update(this.material!.id!, payload)
      : this.materialService.create(payload);
    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode ? 'Material actualizada' : 'Material creada',
        });
        this.closeDialog(true);
      },
      error: (err) => {
        console.error(err);
        const detail =
          err.status === 403
            ? 'No tienes permisos para esta acción (rol ADMIN requerido)'
            : 'No se pudo guardar';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      },
    });
  }

  closeDialog(saved: boolean = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
