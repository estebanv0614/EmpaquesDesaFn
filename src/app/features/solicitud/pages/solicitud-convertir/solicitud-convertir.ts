import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';

import { SolicitudCotizacionService } from '../../../../core/services/solicitud-cotizacion.service';
import { PersonService } from '../../../../core/services/person-service';
import { ClientService } from '../../../../core/services/client-service';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { TipoDocumentoService } from '../../../../core/services/tipo-documento-service';
import { MetodoPagoService } from '../../../../core/services/metodo-pago-service';
import { EstadoService } from '../../../../core/services/estado-service';
import { UserService } from '../../../../core/services/user-service';
import { DocumentoComercialService } from '../../../../core/services/documento-comercial-service';

import { SolicitudCotizacionResponse } from '../../../../shared/models/solicitud-cotizacion-request.model';
import { Person } from '../../../../shared/models/person.model';
import { Client } from '../../../../shared/models/client.model';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { TipoDocumento } from '../../../../shared/models/tipo-documento.model';
import { MetodoPago } from '../../../../shared/models/metodo-pago.model';
import { Estado } from '../../../../shared/models/estado.model';
import { DocumentoComercial } from '../../../../shared/models/documento-comercial.model';

@Component({
  selector: 'app-solicitud-convertir',
  standalone: true,
  imports: [CommonModule, PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './solicitud-convertir.html',
  styleUrl: './solicitud-convertir.css',
})
export class SolicitudConvertir implements OnInit {
  solicitud = signal<SolicitudCotizacionResponse | null>(null);
  loading = signal(false);
  guardando = signal(false);

  buscandoCliente = signal(false);
  clienteEncontrado = signal<Client | null>(null);
  personaEncontrada = signal<Person | null>(null);
  documentoCreado = signal<DocumentoComercial | null>(null);

  bolsas = signal<Bolsa[]>([]);
  tiposDocumento = signal<TipoDocumento[]>([]);
  metodosPago = signal<MetodoPago[]>([]);
  estados = signal<Estado[]>([]);

  form: FormGroup;
  clienteForm: FormGroup;

  readonly ESTADO_CLIENTE_ACTIVO = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private solicitudService: SolicitudCotizacionService,
    private personService: PersonService,
    private clientService: ClientService,
    private bolsaService: BolsaService,
    private tipoDocumentoService: TipoDocumentoService,
    private metodoPagoService: MetodoPagoService,
    private estadoService: EstadoService,
    private userService: UserService,
    private documentoService: DocumentoComercialService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      numeroFactura: ['', Validators.required],
      tipoDocumento: [null, Validators.required],
      metodoPago: [null, Validators.required],
      estado: [null, Validators.required],
      observaciones: [''],
      detalles: this.fb.array([]),
    });

    this.clienteForm = this.fb.group({
      tipoDocumento: [null, Validators.required],
      documentNumber: ['', Validators.required],
      name: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      empresa: [''],
    });
  }

  get detallesArray(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);

    this.bolsaService.getAll().subscribe((data) => this.bolsas.set(data));
    this.tipoDocumentoService.getAll().subscribe((data) => this.tiposDocumento.set(data));
    this.metodoPagoService.getAll().subscribe((data) => this.metodosPago.set(data));
    this.estadoService.getAll().subscribe((data) => this.estados.set(data));

    this.solicitudService.getById(id).subscribe({
      next: (data) => {
        this.solicitud.set(data);
        this.loading.set(false);
        this.inicializarDetalles(data);
        this.buscarCliente(data.mail, data.phone);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la solicitud',
        });
      },
    });
  }

  inicializarDetalles(solicitud: SolicitudCotizacionResponse): void {
    this.form.patchValue({ observaciones: solicitud.observacion });

    solicitud.detalles.forEach((detalle) => {
      this.detallesArray.push(
        this.fb.group({
          bolsa: [null, Validators.required],
          cantidad: [1, [Validators.required, Validators.min(1)]],
          precioUnitarioSnapshot: [0, [Validators.required, Validators.min(0)]],
          descripcionOriginal: [detalle.descripcionProducto],
          cantidadEstimadaOriginal: [detalle.cantidadEstimada],
        }),
      );
    });
  }

  buscarCliente(email?: string, phone?: string): void {
    this.buscandoCliente.set(true);
    this.personService.search(email, phone).subscribe({
      next: (persona) => {
        this.personaEncontrada.set(persona);
        this.clientService.getByPersonId(persona.id).subscribe({
          next: (cliente) => {
            this.clienteEncontrado.set(cliente);
            this.buscandoCliente.set(false);
          },
          error: () => {
            this.clienteEncontrado.set(null);
            this.buscandoCliente.set(false);
            this.prellenarClienteForm(persona);
          },
        });
      },
      error: () => {
        this.personaEncontrada.set(null);
        this.clienteEncontrado.set(null);
        this.buscandoCliente.set(false);
        const s = this.solicitud();
        if (s) {
          this.clienteForm.patchValue({
            name: s.name,
            phone: s.phone,
            email: s.mail,
            address: s.address,
            //empresa: s.empresa,
          });
        }
      },
    });
  }

  prellenarClienteForm(persona: Person): void {
    this.clienteForm.patchValue({
      tipoDocumento: persona.tipoDocumento,
      documentNumber: persona.documentNumber,
      name: persona.name,
      phone: persona.phone,
      email: persona.email,
      address: persona.address,
    });
  }

  onBolsaSeleccionada(index: number): void {
    const grupo = this.detallesArray.at(index);
    const bolsa: Bolsa = grupo.get('bolsa')?.value;
    if (bolsa) {
      grupo.get('precioUnitarioSnapshot')?.setValue(bolsa.precioBase);
    }
  }

  subtotalLinea(index: number): number {
    const grupo = this.detallesArray.at(index);
    const cantidad = grupo.get('cantidad')?.value || 0;
    const precio = grupo.get('precioUnitarioSnapshot')?.value || 0;
    return cantidad * precio;
  }

  subtotalGeneral(): number {
    return this.detallesArray.controls.reduce(
      (acc: number, _, i) => acc + this.subtotalLinea(i),
      0,
    );
  }

  ivaCalculado(): number {
    return this.subtotalGeneral() * 0.19;
  }

  totalGeneral(): number {
    return this.subtotalGeneral() + this.ivaCalculado();
  }

  guardar(): void {
    this.guardando.set(true);

    if (this.form.invalid || this.detallesArray.length === 0) {
      this.form.markAllAsTouched();
      this.guardando.set(false);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Revisa los campos requeridos',
      });
      return;
    }

    const clienteExistente = this.clienteEncontrado();
    if (clienteExistente) {
      this.crearDocumento(clienteExistente);
      return;
    }

    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.guardando.set(false);
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos de cliente incompletos',
        detail: 'Completa los datos del cliente',
      });
      return;
    }

    const personaExistente = this.personaEncontrada();

    if (personaExistente) {
      this.crearCliente(personaExistente);
    } else {
      this.personService.create(this.armarPersonPayload()).subscribe({
        next: (persona) => this.crearCliente(persona),
        error: (err) => this.manejarError(err, 'No se pudo crear la persona'),
      });
    }
  }

  private armarPersonPayload(): any {
    return {
      tipoDocumento: this.clienteForm.value.tipoDocumento,
      documentNumber: this.clienteForm.value.documentNumber,
      name: this.clienteForm.value.name,
      phone: this.clienteForm.value.phone,
      email: this.clienteForm.value.email,
      address: this.clienteForm.value.address,
    };
  }

  private crearCliente(persona: Person): void {
    const payload: any = {
      person: persona,
      empresa: this.clienteForm.value.empresa,
      estado: { id: this.ESTADO_CLIENTE_ACTIVO, name: 'ACTIVO' },
    };
    this.clientService.create(payload).subscribe({
      next: (cliente) => this.crearDocumento(cliente),
      error: (err) => this.manejarError(err, 'No se pudo crear el cliente'),
    });
  }

  private crearDocumento(cliente: Client): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        const payload: DocumentoComercial = {
          numeroFactura: this.form.value.numeroFactura,
          tipoDocumento: this.form.value.tipoDocumento,
          client: cliente,
          user: { id: user.id },
          fechaEmision: new Date().toISOString(),
          subtotal: this.subtotalGeneral(),
          iva: this.ivaCalculado(),
          total: this.totalGeneral(),
          metodoPago: this.form.value.metodoPago,
          estado: this.form.value.estado,
          referenciaCotizacionId: this.solicitud()?.id,
          observaciones: this.form.value.observaciones,
          detalles: this.detallesArray.controls.map((grupo, i) => ({
            bolsa: grupo.get('bolsa')?.value,
            cantidad: grupo.get('cantidad')?.value,
            precioUnitarioSnapshot: grupo.get('precioUnitarioSnapshot')?.value,
            subtotal: this.subtotalLinea(i),
          })),
        };
        this.documentoService.create(payload).subscribe({
          next: (documentoCreado) => {
            this.guardando.set(false);
            this.documentoCreado.set(documentoCreado);
            this.messageService.add({
              severity: 'success',
              summary: 'Cotización creada',
              detail: 'El documento comercial se generó correctamente',
            });
          },
          error: (err) => this.manejarError(err, 'No se pudo crear el documento comercial'),
        });
      },
      error: (err) => this.manejarError(err, 'No se pudo obtener el usuario actual'),
    });
  }

  descargarPdf(): void {
    const doc = this.documentoCreado();
    if (!doc?.id) return;

    this.documentoService.descargarPdf(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar el PDF',
        });
      },
    });
  }

  volverASolicitudes(): void {
    this.router.navigate(['/solicitudes-cotizacion']);
  }

  private manejarError(err: any, detalle: string): void {
    console.error(err);
    this.guardando.set(false);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'El documento comercial no se pudo generar correctamente',
    });
  }
}
