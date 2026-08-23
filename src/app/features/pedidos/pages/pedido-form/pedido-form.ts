import { Component, EventEmitter, OnInit, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';

import { PedidoService } from '../../../../core/services/pedido.service';
import { ClientService } from '../../../../core/services/client-service';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { EstadoService } from '../../../../core/services/estado-service';
import { MetodoPagoService } from '../../../../core/services/metodo-pago-service';
import { UserService } from '../../../../core/services/user-service';

import { Client } from '../../../../shared/models/client.model';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { Estado } from '../../../../shared/models/estado.model';
import { MetodoPago } from '../../../../shared/models/metodo-pago.model';
import { date } from '@primeuix/themes/aura/datepicker';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './pedido-form.html',
  styleUrl: './pedido-form.css',
})
export class PedidoForm implements OnInit {
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;
  guardando = signal(false);

  clientes = signal<Client[]>([]);
  bolsas = signal<Bolsa[]>([]);
  estados = signal<Estado[]>([]);
  estadosPedido = signal<Estado[]>([]);
  metodosPago = signal<MetodoPago[]>([]);

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private clientService: ClientService,
    private bolsaService: BolsaService,
    private estadoService: EstadoService,
    private metodoPagoService: MetodoPagoService,
    private userService: UserService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      numeroPedido: ['', Validators.required],
      client: [null, Validators.required],
      estado: [null, Validators.required],
      metodoPago: [null],
      fechaEntregaEstimada: [null],
      observacion: [''],
      detalles: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.clientService.getAll().subscribe((data) => this.clientes.set(data));
    this.bolsaService.getAll().subscribe((data) => this.bolsas.set(data));
    this.estadoService.getAll().subscribe((data) => this.estados.set(data));
    this.metodoPagoService.getAll().subscribe((data) => this.metodosPago.set(data));

    this.agregarDetalle();
  }

  get detallesArray(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  crearDetalle(): FormGroup {
    return this.fb.group({
      bolsa: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitarioVenta: [0, [Validators.required, Validators.min(0)]],
    });
  }

  agregarDetalle(): void {
    this.detallesArray.push(this.crearDetalle());
  }

  eliminarDetalle(index: number): void {
    if (this.detallesArray.length > 1) {
      this.detallesArray.removeAt(index);
    }
  }

  onBolsaSeleccionada(index: number): void {
    const grupo = this.detallesArray.at(index);
    const bolsa: Bolsa = grupo.get('bolsa')?.value;
    if (bolsa) {
      grupo.get('precioUnitarioVenta')?.setValue(bolsa.precioBase);
    }
  }

  subtotalLinea(index: number): number {
    const grupo = this.detallesArray.at(index);
    const cantidad = grupo.get('cantidad')?.value || 0;
    const precio = grupo.get('precioUnitarioVenta')?.value || 0;
    return cantidad * precio;
  }

  subtotalGeneral(): number {
    return this.detallesArray.controls.reduce(
      (acc: number, _, i) => acc + this.subtotalLinea(i),
      0,
    );
  }

  impuestosCalculados(): number {
    return this.subtotalGeneral() * 0.19;
  }

  totalGeneral(): number {
    return this.subtotalGeneral() + this.impuestosCalculados();
  }

  onSave(): void {
    if (this.form.invalid || this.detallesArray.length === 0) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Revisa los campos requeridos',
      });
      return;
    }

    this.guardando.set(true);

    this.userService.getMe().subscribe({
      next: (user) => {
        const payload = {
          numeroPedido: this.form.value.numeroPedido,
          client: this.form.value.client,
          userVendedor: { id: user.id },
          estado: this.form.value.estado,
          fechaEntregaEstimada: this.form.value.fechaEntregaEstimada
            ? this.formatearFecha(this.form.value.fechaEntregaEstimada)
            : null,
          subtotal: this.subtotalGeneral(),
          impuestos: this.impuestosCalculados(),
          total: this.totalGeneral(),
          metodoPago: this.form.value.metodoPago,
          observacion: this.form.value.observacion,
          detalles: this.detallesArray.controls.map((grupo, i) => ({
            bolsa: grupo.get('bolsa')?.value,
            cantidad: grupo.get('cantidad')?.value,
            precioUnitarioVenta: grupo.get('precioUnitarioVenta')?.value,
            subtotalLinea: this.subtotalLinea(i),
          })),
        };

        this.pedidoService.create(payload).subscribe({
          next: () => {
            this.guardando.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Pedido creado correctamente',
            });
            this.closeDialog(true);
          },
          error: (err) => {
            console.error(err);
            this.guardando.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el pedido',
            });
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener el usuario actual',
        });
      },
    });
  }

  private formatearFecha(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  closeDialog(saved: boolean = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
