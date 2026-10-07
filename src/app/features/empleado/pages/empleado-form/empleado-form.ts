import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { EmployeeService } from '../../../../core/services/employee.service';
import { PersonService } from '../../../../core/services/person-service';
import { EstadoService } from '../../../../core/services/estado-service';
import { TipoDocumentoService } from '../../../../core/services/tipo-documento-service';
import { Empleado } from '../../../../shared/models/empleado.model';
import { Person } from '../../../../shared/models/person.model';
import { Estado } from '../../../../shared/models/estado.model';
import { TipoDocumento } from '../../../../shared/models/tipo-documento.model';


@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './empleado-form.html',
  styleUrl: './empleado-form.css',
})
export class EmpleadoForm implements OnInit {
  @Input() empleado: Empleado | null = null;
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;
  isEditMode = false;
  enviando = signal(false);

  personas = signal<Person[]>([]);
  estados = signal<Estado[]>([]);
  tiposDocumento = signal<TipoDocumento[]>([]);

  mostrarNuevaPersona = signal(false);
  creandoPersona = signal(false);
  personaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: EmployeeService,
    private personService: PersonService,
    private estadoService: EstadoService,
    private tipoDocumentoService: TipoDocumentoService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      person: [null, Validators.required],
      position: ['', Validators.required],
      salary: [null, [Validators.required, Validators.min(0)]],
      fechaIngreso: [new Date(), Validators.required],
      estado: [null, Validators.required],
    });

    this.personaForm = this.fb.group({
      tipoDocumento: [null, Validators.required],
      documentNumber: ['', Validators.required],
      name: ['', Validators.required],
      phone: [''],
      email: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.cargarPersonas();
    this.estadoService.getAll().subscribe({ next: (d: Estado[]) => this.estados.set(d) });
    this.tipoDocumentoService.getAll().subscribe({ next: (d: TipoDocumento[]) => this.tiposDocumento.set(d) });

    if (this.empleado) {
      this.isEditMode = true;
      this.form.patchValue(this.empleado);
      this.form.get('person')?.disable();
    }
  }

  private cargarPersonas(): void {
    this.personService.getAll().subscribe({ next: (d: Person[]) => this.personas.set(d) });
  }

  abrirNuevaPersona(): void {
    this.personaForm.reset();
    this.mostrarNuevaPersona.set(true);
  }

  guardarNuevaPersona(): void {
    if (this.personaForm.invalid) {
      this.personaForm.markAllAsTouched();
      return;
    }

    const v = this.personaForm.value;
    const dto = {
      tipoDocumento: { id: v.tipoDocumento.id },
      documentNumber: v.documentNumber,
      name: v.name,
      phone: v.phone,
      email: v.email,
      address: v.address,
    };

    this.creandoPersona.set(true);
    this.personService.create(dto as Person).subscribe({
      next: (nueva) => {
        this.creandoPersona.set(false);
        this.mostrarNuevaPersona.set(false);
        this.cargarPersonas();
        this.form.get('person')?.setValue(nueva);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Persona creada' });
      },
      error: (err) => {
        this.creandoPersona.set(false);
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la persona' });
      },
    });
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const dto = {
      person: { id: v.person.id },
      position: v.position,
      salary: v.salary,
      fechaIngreso: this.toIso(new Date(v.fechaIngreso)),
      estado: { id: v.estado.id },
    };

    this.enviando.set(true);
    const request = this.isEditMode
      ? this.service.update(this.empleado!.id, dto.person.id)
      : this.service.create(dto);

    request.subscribe({
      next: () => {
        this.enviando.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: this.isEditMode ? 'Empleado actualizado' : 'Empleado creado' });
        this.close(true);
      },
      error: (err) => {
        this.enviando.set(false);
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' });
      },
    });
  }

  close(saved = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
