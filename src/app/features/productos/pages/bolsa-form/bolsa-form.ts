import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { EstadoService } from '../../../../core/services/estado-service';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { Estado } from '../../../../shared/models/estado.model';

@Component({
  selector: 'app-bolsa-form',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './bolsa-form.html',
  styleUrl: './bolsa-form.css',
})
export class BolsaForm {
  @Input() bolsa: Bolsa | null = null;
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;
  estados = signal<Estado[]>([]);
  isEditMode = false;
  enviado = signal(false);
  enviando = signal(false);

  constructor(
    private fb: FormBuilder,
    private bolsaService: BolsaService,
    private estadoService: EstadoService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      anchoCm: [null, [Validators.required, Validators.min(0.01)]],
      largoCm: [null, [Validators.required, Validators.min(0.01)]],
      calibre: [null, [Validators.required, Validators.min(0.01)]],
      precioBase: [null, [Validators.required, Validators.min(0)]],
      stockActual: [0, [Validators.min(0)]],
      estado: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.estadoService.getAll().subscribe({
      next: (data) => this.estados.set(data),
      error: (err) => console.error(err),
    });

    if (this.bolsa) {
      this.isEditMode = true;
      this.form.patchValue(this.bolsa);
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.enviando());
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Bolsa = this.form.value;

    const request = this.isEditMode
      ? this.bolsaService.update(this.bolsa!.id, payload)
      : this.bolsaService.create(payload);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode ? 'Bolsa actualizada' : 'Bolsa creada',
        });
        this.closeDialog(true);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' });
      },
    });
  }

  closeDialog(saved: boolean = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
