import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Pedido } from '../../../../shared/models/pedido.model';

@Component({
  selector: 'app-mi-pedido-list',
  standalone: true,
  imports: [PrimeImportsModule, DatePipe, CurrencyPipe],
  templateUrl: './mi-pedido.html',
  styleUrl: './mi-pedido.css',
})
export class MiPedidoList implements OnInit {
  pedidos = signal<Pedido[]>([]);
  loading = signal(false);

  showDetalle = signal(false);
  selectedPedido = signal<Pedido | null>(null);

  constructor(
    private pedidoService: PedidoService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.loading.set(true);
    this.pedidoService.getMisPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar tus pedidos' });
      }
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

  severityEstado(nombreEstado: string): 'warn' | 'success' | 'danger' | 'secondary' {
    if (nombreEstado === 'PENDIENTE') return 'warn';
    if (nombreEstado === 'PAGADO' || nombreEstado === 'ENTREGADO') return 'success';
    if (nombreEstado === 'CANCELADO') return 'danger';
    return 'secondary';
  }
}
