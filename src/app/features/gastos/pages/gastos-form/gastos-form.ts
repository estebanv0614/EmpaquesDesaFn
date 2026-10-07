import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
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
export class GastosForm implements OnInit {
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;

  tiposGasto = signal<TipoGasto[]>([]);
  metodosPago = signal<MetodoPago[]>([]);
  empleados = signal<Empleado[]>([]);
  materiales = signal<Material[]>([]);

  archivo: File | null = null;
  enviando = signal(false);

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
  }

  get esCompraMaterial(): boolean {
    return this.form.value.tipoGasto?.name === 'COMPRA DE MATERIAL';
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

  onFile(event: any): void {
    this.archivo = event.target?.files?.[0] ?? null;
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
    if (this.esCompraMaterial && (!v.material || !v.cantidad)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta información',
        detail: 'Selecciona el material y la cantidad',
      });
      return;
    }

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
    if (this.archivo) fd.append('evidencia', this.archivo);

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
