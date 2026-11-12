import {
  Component,
  EventEmitter,
  OnInit,
  OnDestroy,
  Output,
  signal,
  computed,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { GastoOperativoService } from '../../../../core/services/gasto-operativo.service';
import { TipoGastoService } from '../../../../core/services/tipo-gasto.service';
import { MetodoPagoService } from '../../../../core/services/metodo-pago-service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { MaterialService } from '../../../../core/services/material.service';
import { TipoGasto } from '../../../../shared/models/tipo-gasto';
import { MetodoPago } from '../../../../shared/models/metodo-pago.model';
import { Empleado } from '../../../../shared/models/empleado.model';
import { Material } from '../../../../shared/models/material.model';

@Component({
  selector: 'app-gastos-form',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './gastos-form.html',
  styleUrl: './gastos-form.css',
})
export class GastosForm implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;

  tiposGasto = signal<TipoGasto[]>([]);
  metodosPago = signal<MetodoPago[]>([]);
  empleados = signal<Empleado[]>([]);
  materiales = signal<Material[]>([]);
  archivo: File | null = null;
  enviando = signal(false);

  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;
  arrastrando = signal(false);
  errorImagen = signal<string | null>(null);

  private imagenOriginal: string | null = null;
  private readonly TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_BYTES = 5 * 1024 * 1024;

  private readonly RESPONSABLE_COMPRA = ['Supervisor'];

  responsable = computed(() =>
    this.empleados().filter((m) => !this.RESPONSABLE_COMPRA.includes(m.person.name.toUpperCase())),
  );

  constructor(
    private fb: FormBuilder,
    private service: GastoOperativoService,
    private tipoGastoService: TipoGastoService,
    private metodoPagoService: MetodoPagoService,
    private employeeService: EmployeeService,
    private materialService: MaterialService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      tipoGasto: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(1)]],
      fechaGasto: [new Date(), Validators.required],
      descripcion: ['', Validators.required],
      metodoPago: [null, Validators.required],
      empleado: [null, Validators.required],
      material: [null],
      cantidad: [null],
    });

    this.form.get('tipoGasto')!.valueChanges.subscribe(() => {
      const material = this.form.get('material')!;
      const cantidad = this.form.get('cantidad')!;

      if (this.esCompraMaterial) {
        material.setValidators(Validators.required);
        cantidad.setValidators([Validators.required, Validators.min(1)]);
      } else {
        material.clearValidators();
        cantidad.clearValidators();
        material.reset();
        cantidad.reset();
      }
      material.updateValueAndValidity();
      cantidad.updateValueAndValidity();
    });
  }

  get esCompraMaterial(): boolean {
    const nombre = (this.form.get('tipoGasto')?.value?.name ?? '')
      .toString()
      .toUpperCase()
      .replace(/_/g, ' ');
    return nombre.includes('COMPRA') && nombre.includes('MATERIAL');
  }

  ngOnInit(): void {
    this.tipoGastoService
      .getAll()
      .subscribe({ next: (d) => this.tiposGasto.set(d), error: (e) => console.error(e) });
    this.metodoPagoService
      .getAll()
      .subscribe({ next: (d) => this.metodosPago.set(d), error: (e) => console.error(e) });
    this.employeeService
      .getAll()
      .subscribe({ next: (d) => this.empleados.set(d), error: (e) => console.error(e) });
    this.materialService
      .getAll()
      .subscribe({ next: (d) => this.materiales.set(d), error: (e) => console.error(e) });
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
    this.archivoSeleccionado = null;
    this.previewUrl = this.imagenOriginal;
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
    this.archivoSeleccionado = file;
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

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const fd = new FormData();
    fd.append('idTipoGasto', v.tipoGasto.id);
    fd.append('monto', String(v.monto));
    fd.append('fechaGasto', this.toIso(v.fechaGasto));
    fd.append('descripcion', v.descripcion);
    fd.append('idMetodoPago', v.metodoPago.id);
    fd.append('idEmpleado', v.empleado.id);
    if (this.esCompraMaterial) {
      fd.append('idMaterial', v.material.id);
      fd.append('cantidad', String(v.cantidad));
    }
    if (this.archivoSeleccionado) {
      fd.append('evidencia', this.archivoSeleccionado);
    }

    this.enviando.set(true);
    this.service.create(fd).subscribe({
      next: () => {
        this.enviando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Gasto registrado',
        });
        this.close(true);
      },
      error: (err) => {
        this.enviando.set(false);
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar',
        });
      },
    });
  }

  close(saved = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
