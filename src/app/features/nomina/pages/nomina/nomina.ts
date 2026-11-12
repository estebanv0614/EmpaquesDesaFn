import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';
import { NominaService } from '../../../../core/services/nomina.service';
import { MetodoPagoService } from '../../../../core/services/metodo-pago-service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { PagoNomina } from '../../../../shared/models/pago-nomina.model';
import { MetodoPago } from '../../../../shared/models/metodo-pago.model';
import { Empleado } from '../../../../shared/models/empleado.model';
import { PersonService } from '../../../../core/services/person-service';
import { Person } from '../../../../shared/models/person.model';

@Component({
  selector: 'app-nomina',
  standalone: true,
  imports: [PrimeImportsModule, CurrencyPipe, DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './nomina.html',
  styleUrl: './nomina.css',
})
export class Nomina implements OnInit, OnDestroy {
  semana = signal<Date>(new Date());
  pagos = signal<PagoNomina[]>([]);
  loading = signal(false);
  metodosPago = signal<MetodoPago[]>([]);
  empleados = signal<Empleado[]>([]);
  persona = signal<Person[]>([]);

  adminPersonas = computed(() =>
    this.persona().filter((p: any) => {
      const rol = (p.rol ?? p.usuario?.rol ?? '').toString().toUpperCase();
      const nombre = (p.name ?? '').toUpperCase();
      return rol.includes('ADMIN') || nombre.includes('DIANA');
    }),
  );

  private readonly RESPONSABLE_AUTORIZADO = ['DIANA MARCELA PIRAGAUTA GALINDO'];
  responsableAdmin = computed(() =>
  this.persona().filter((p) => 
    this.RESPONSABLE_AUTORIZADO.includes((p.name || '').toUpperCase().trim())
  )
);

  totalSemana = computed(() => this.pagos().reduce((a, p) => a + p.totalPagar, 0));
  totalPendiente = computed(() =>
    this.pagos()
      .filter((p) => !p.pagado)
      .reduce((a, p) => a + p.totalPagar, 0),
  );

  showEditar = false;
  editando: PagoNomina | null = null;
  bonos = 0;
  deducciones = 0;
  observacion = '';

  showPagar = false;
  pagando: PagoNomina | null = null;
  metodoSel: MetodoPago | null = null;
  responsableSel: Person | null = null;
  archivoComprobante: File | null = null;
  generando = signal(false);

  previewUrl: string | null = null;
  arrastrando = signal(false);
  errorImagen = signal<string | null>(null);

  private readonly TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_BYTES = 5 * 1024 * 1024;

  constructor(
    private service: NominaService,
    private metodoPagoService: MetodoPagoService,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private personService: PersonService,
  ) {}

  ngOnInit(): void {
    this.metodoPagoService.getAll().subscribe({ next: (d) => this.metodosPago.set(d) });
    this.employeeService.getAll().subscribe({ next: (d) => this.empleados.set(d) });
    this.personService.getAll().subscribe({ next: (d) => this.persona.set(d) });
    this.cargar();
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  cambiarSemana(d: Date): void {
    this.semana.set(d);
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.service.listar(this.iso(this.semana())).subscribe({
      next: (d) => {
        this.pagos.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  generar(): void {
    this.generando.set(true);
    this.service.generar(this.iso(this.semana())).subscribe({
      next: (d) => {
        this.pagos.set(d);
        this.messageService.add({
          severity: 'success',
          summary: 'Nómina generada',
          detail: `${d.length} empleados`,
        });
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar',
        }),
    });
  }

  abrirEditar(p: PagoNomina): void {
    this.editando = p;
    this.bonos = p.bonificaciones;
    this.deducciones = p.deducciones;
    this.observacion = p.observacion ?? '';
    this.showEditar = true;
  }

  guardarEdicion(): void {
    if (!this.editando) return;
    this.service
      .actualizar(this.editando.id, {
        bonificaciones: this.bonos,
        deducciones: this.deducciones,
        observacion: this.observacion,
      })
      .subscribe({
        next: () => {
          this.showEditar = false;
          this.cargar();
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Nómina ajustada',
          });
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar',
          }),
      });
  }

  abrirPagar(p: PagoNomina): void {
    this.pagando = p;
    this.metodoSel = null;
    this.responsableSel = null;
    this.liberarPreview();
    this.archivoComprobante = null;
    this.previewUrl = null;
    this.errorImagen.set(null);
    this.showPagar = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.procesarArchivo(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.procesarArchivo(file);
  }

  quitarImagen(): void {
    this.liberarPreview();
    this.archivoComprobante = null;
    this.previewUrl = null;
    this.errorImagen.set(null);
  }

  private procesarArchivo(file: File): void {
    if (!this.TIPOS_PERMITIDOS.includes(file.type)) {
      this.errorImagen.set('Solo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }
    if (file.size > this.MAX_BYTES) {
      this.errorImagen.set('La imagen no puede superar los 5 MB.');
      return;
    }
    this.errorImagen.set(null);
    this.liberarPreview();
    this.archivoComprobante = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  private liberarPreview(): void {
    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  ngOnDestroy(): void {
    this.liberarPreview();
  }

  confirmarPago(): void {
    if (!this.pagando || !this.metodoSel || !this.responsableSel) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta información',
        detail: 'Selecciona método de pago y responsable',
      });
      return;
    }

    const fd = new FormData();
    fd.append('idMetodoPago', String(this.metodoSel.id));
    fd.append('idEmpleado', String(this.responsableSel.id));
    if (this.archivoComprobante) fd.append('evidencia', this.archivoComprobante);

    this.service.pagar(this.pagando.id, fd).subscribe({
      next: () => {
        this.liberarPreview();
        this.showPagar = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Pagado',
          detail: 'Nómina registrada como gasto',
        });
        this.cargar();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo pagar',
        }),
    });
  }
}
