import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';
import { PedidoService } from '../../../../core/services/pedido.service';
import { EstadoService } from '../../../../core/services/estado-service';
import { Pedido } from '../../../../shared/models/pedido.model';
import { Estado } from '../../../../shared/models/estado.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pedido-list',
  standalone: true,
  imports: [PrimeImportsModule, DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './pedido-list.html',
  styleUrl: './pedido-list.css',
})
export class PedidoList implements OnInit {
  pedidos = signal<Pedido[]>([]);
  loading = signal(false);
  estados = signal<Estado[]>([]);

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
    if (pedido.estado.id === nuevoEstado.id) return;

    this.pedidoService.updateEstado(pedido.id, nuevoEstado.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: `Pedido ${pedido.numeroPedido} → ${nuevoEstado.name}`,
        });
        this.loadPedidos();
      },
      error: (err) => {
        console.error(err);
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
