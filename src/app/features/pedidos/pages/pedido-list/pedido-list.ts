import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';
import { PedidoService } from '../../../../core/services/pedido.service';
import { EstadoService } from '../../../../core/services/estado-service';
import { Pedido } from '../../../../shared/models/pedido.model';
import { Estado } from '../../../../shared/models/estado.model';
import { FormsModule } from '@angular/forms';
import { PedidoForm } from '../pedido-form/pedido-form';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [PrimeImportsModule, DatePipe, CurrencyPipe, FormsModule, PedidoForm],
  templateUrl: './pedido-list.html',
  styleUrl: './pedido-list.css',
})
export class PedidoList implements OnInit {
  pedidos = signal<Pedido[]>([]);
  loading = signal(false);
  estados = signal<Estado[]>([]);

  showForm = signal(false);
  showDetalle = signal(false);
  selectedPedido = signal<Pedido | null>(null);

  constructor(
    private pedidoService: PedidoService,
    private estadoService: EstadoService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
    this.estadoService.getAll().subscribe({
      next: (data) => this.estados.set(data),
      error: (err) => console.error(err),
    });
  }

  openCreate(): void {
    this.showForm.set(true);
  }

  onFormClosed(saved: boolean): void {
    this.showForm.set(false);
    if (saved) {
      this.loadPedidos();
    }
  }

  loadPedidos(): void {
    this.loading.set(true);
    this.pedidoService.getAll().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de pedidos',
        });
      },
    });
  }

  verDetalle(pedido: Pedido): void {
    this.selectedPedido.set(pedido);
    this.showDetalle.set(true);
  }

  cerrarDetalle(): void {
    this.showDetalle.set(false);
    this.selectedPedido.set(null);
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: Estado): void {
    if (pedido.estado?.id === nuevoEstado.id) return;

    const estadoAnterior = pedido.estado;
    pedido.estado = nuevoEstado;
    const tagSeverity = this.severityEstado(nuevoEstado.name);
    const toastSeverity = tagSeverity === 'danger' ? 'error' : tagSeverity;

    this.pedidoService.updateEstado(pedido.id, nuevoEstado.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: toastSeverity,
          summary: 'Actualizado',
          detail: `Pedido ${pedido.numeroPedido} → ${nuevoEstado.name}`,
        });
      },
      error: (err) => {
        console.error(err);
        pedido.estado = estadoAnterior;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado',
        });
      },
    });
  }

  severityEstado(nombreEstado: string): 'warn' | 'success' | 'danger' | 'info' | 'secondary' {
    if (nombreEstado === 'PENDIENTE') return 'warn';
    if (nombreEstado === 'EN PROCESO') return 'info';
    if (nombreEstado === 'EN CAMINO') return 'info';
    if (nombreEstado === 'ENTREGADO') return 'success';
    if (nombreEstado === 'CANCELADO') return 'danger';
    return 'secondary';
  }
}
