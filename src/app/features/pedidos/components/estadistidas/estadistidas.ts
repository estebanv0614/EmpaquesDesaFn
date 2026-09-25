import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { PedidoService } from '../../../../core/services/pedido.service';
import {
  ResumenPedidos,
  EstadisticaPeriodo,
} from '../../../../shared/models/pedido-estadisticas.model';

@Component({
  selector: 'app-estadistidas',
  standalone: true,
  imports: [PrimeImportsModule, CommonModule],
  templateUrl: './estadistidas.html',
  styleUrl: './estadistidas.css',
})
export class Estadistidas implements OnInit {
  resumen = signal<ResumenPedidos | null>(null);
  estadisticasMes = signal<EstadisticaPeriodo[]>([]);
  estadisticasDia = signal<EstadisticaPeriodo[]>([]);

  chartDataMes = computed(() => this.armarChartData(this.estadisticasMes(), 'Pedidos por mes'));
  chartDataDia = computed(() => this.armarChartData(this.estadisticasDia(), 'Pedidos por día'));

  chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();

    this.pedidoService.pedidosActualizados$.subscribe(() => {
      this.cargarEstadisticas();
    });
  }

  private cargarEstadisticas(): void {
    this.pedidoService.getResumen().subscribe({
      next: (data: any) => {
        console.log('Datos de resumen recibidos:', data);

        // Mapeamos las propiedades del backend a los nombres que usa tu HTML
        const resumenMapeado: ResumenPedidos = {
          hoy: data.hoy ?? 0,
          estaSemana: data.semanaActual ?? 0,
          esteMes: data.mesActual ?? 0,
          esteAnio: data.anioActual ?? 0, 
        };

        this.resumen.set(resumenMapeado);
      },
      error: (err) => console.error(err),
    });

    this.pedidoService.getEstadisticasPorMes().subscribe({
      next: (data) => this.estadisticasMes.set(data),
      error: (err) => console.error(err),
    });

    this.pedidoService.getEstadisticasPorDia().subscribe({
      next: (data) => this.estadisticasDia.set(data),
      error: (err) => console.error(err),
    });
  }

  private armarChartData(datos: EstadisticaPeriodo[], label: string) {
    return {
      labels: datos.map((d) => d.periodo),
      datasets: [
        {
          label,
          data: datos.map((d) => d.cantidad),
          fill: true,
          borderColor: '#0f6e56',
          backgroundColor: 'rgba(15, 110, 86, 0.15)',
          tension: 0.3,
        },
      ],
    };
  }
}
