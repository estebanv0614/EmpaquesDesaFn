import { Component, EventEmitter, Input, OnInit, Output, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';
import { PersonService } from '../../../../core/services/person-service';
import { TipoDocumentoService } from '../../../../core/services/tipo-documento-service';
import { Person } from '../../../../shared/models/person.model';
import { TipoDocumento } from '../../../../shared/models/tipo-documento.model';
import { Client } from '../../../../shared/models/client.model';
import { ClientService } from '../../../../core/services/client-service';

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
  tieneCliente = false;

  private readonly TIPOS_COMERCIALES = ['COTIZACION', 'FACTURA'];

  tipoDocumentoPersona = computed(() =>
    this.tiposDocumento().filter((t) => !this.TIPOS_COMERCIALES.includes(t.name.toUpperCase())),
  );

  //Cliente//
  client: Client | null = null;
  tipoCliente = [
    { label: 'Detallista', value: 'DETAL' },
    { label: 'Mayorista', value: 'MAYORISTA' },
  ];

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private tipoDocumentoService: TipoDocumentoService,
    private messageService: MessageService,
    private clientService: ClientService,
  ) {
    this.form = this.fb.group({
      tipoDocumento: [null, Validators.required],
      documentNumber: ['', Validators.required],
      name: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email],
      address: [''],

      empresa: [''],
      tipoCliente: ['DETAL', Validators.required],
      ciudad: [''],
      direccionEntrega: [''],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    this.tipoDocumentoService.getAll().subscribe({
      next: (data) => this.tiposDocumento.set(data),
      error: (err) => console.error(err),
    });

    if (this.person) {
      this.isEditMode = true;

      this.form.patchValue({
        tipoDocumento: this.person.tipoDocumento,
        documentNumber: this.person.documentNumber,
        name: this.person.name,
        phone: this.person.phone,
        email: this.person.email,
        address: this.person.address,
      });

      this.clientService.getAll().subscribe({
        next: (clients) => {
          this.client = clients.find((c) => c.person.id === this.person!.id) ?? null;

          this.tieneCliente = this.client !== null;

          if (this.client) {
            this.form.patchValue({
              empresa: this.client.empresa,
              tipoCliente: this.client.tipoCliente,
              ciudad: this.client.ciudad,
              direccionEntrega: this.client.direccionEntrega,
              observaciones: this.client.observaciones,
            });
          }
        },
        error: (err) => {
          console.error('Error al consultar los clientes:', err);
          this.tieneCliente = false;
        },
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const personPayload: Person = {
      id: this.person?.id ?? 0,
      tipoDocumento: values.tipoDocumento,
      documentNumber: values.documentNumber,
      name: values.name,
      phone: values.phone,
      email: values.email,
      address: values.address,
    };

    const savePerson$ = this.isEditMode
      ? this.personService.update(this.person!.id, personPayload)
      : this.personService.create(personPayload);

    savePerson$.subscribe({
      next: (savedPerson) => {
        if (this.isEditMode && this.client) {
          const clientPayload: Client = {
            ...this.client,
            person: savedPerson,
            empresa: values.empresa,
            tipoCliente: values.tipoCliente,
            ciudad: values.ciudad,
            direccionEntrega: values.direccionEntrega,
            observaciones: values.observaciones,
          };

          this.clientService.update(this.client.id, clientPayload).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Persona y cliente actualizados correctamente',
              });

              this.closeDialog(true);
            },
            error: (err) => {
              console.error('Error al actualizar el cliente:', err);

              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail:
                  'La persona se actualizó, pero no se pudieron actualizar los datos del cliente',
              });
            },
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: this.isEditMode ? 'Persona actualizada' : 'Persona creada',
          });

          this.closeDialog(true);
        }
      },
      error: (err) => {
        console.error('Error al guardar la persona:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la persona',
        });
      },
    });
  }

  closeDialog(saved: boolean = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
