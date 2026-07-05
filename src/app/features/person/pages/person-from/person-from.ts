import { Component, EventEmitter, Input, OnInit, Output, signal  } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';
import { PersonService } from '../../../../core/services/person-service';
import { TipoDocumentoService } from '../../../../core/services/tipo-documento-service';
import { Person } from '../../../../shared/models/person.model';
import { TipoDocumento } from '../../../../shared/models/tipo-documento.model';

@Component({
  selector: 'app-person-from',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './person-from.html',
  styleUrl: './person-from.css',
})
export class PersonFrom implements OnInit {
  @Input() person: Person | null = null;
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;
  tiposDocumento = signal<TipoDocumento[]>([]);
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private tipoDocumentoService: TipoDocumentoService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      tipoDocumento: [null, Validators.required],
      documentNumber: ['', Validators.required],
      name: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.tipoDocumentoService.getAll().subscribe({
      next: (data) => this.tiposDocumento.set(data),
      error: (err) => console.error(err),
    });
    if (this.person) {
      this.isEditMode = true;
      this.form.patchValue(this.person);
    }
  }
  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: Person = this.form.value;
    const request = this.isEditMode
      ? this.personService.update(this.person!.id!, payload)
      : this.personService.create(payload);
    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode ? 'Persona actualizada' : 'Persona creada',
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
