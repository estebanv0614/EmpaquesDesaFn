import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Pedido } from '../../../../shared/models/pedido.model';

/**
 * Dashboard financiero del mes.
 *
 * INGRESOS: salen de los pedidos (campos total, pagado, fechaPago y fechaPedido).
 * GASTOS:   empleados, materiales y otros. Todavía NO están conectados al backend:
 *           ver las señales "gastosEmpleados", "gastosMateriales" y "gastosOtros"
 *           y el método cargarGastos() más abajo.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PrimeImportsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // ---------- Datos base ----------
  pedidos = signal<Pedido[]>([]);
  cargando = signal(false);
  error = signal(false);

  /** Primer día del mes que se está mirando */
  mes = signal<Date>(this.inicioDeMes(new Date()));

  // ---------- GASTOS (pendientes de conectar al backend) ----------
  // null = "sin datos todavía". Cuando exista el endpoint, se asignan aquí los montos del mes.
  gastosEmpleados = signal<number | null>(null);
  gastosMateriales = signal<number | null>(null);
  gastosOtros = signal<number | null>(null);

  // ---------- Cálculos ----------
  etiquetaMes = computed(() => this.nombreMes(this.mes(), true));
  esMesActual = computed(() => this.mismoMes(this.mes(), new Date()));

  /** Pedidos pagados cuyo pago (o pedido, si no hay fecha de pago) cae en el mes */
  pagadosDelMes = computed(() =>
    this.pedidos().filter((p) => p.pagado && this.mismoMes(this.fechaIngreso(p), this.mes())),
  );

  /** Pedidos hechos en el mes que todavía no se han pagado */
  pendientesDelMes = computed(() =>
    this.pedidos().filter((p) => !p.pagado && this.mismoMes(new Date(p.fechaPedido), this.mes())),
  );

  ingresosMes = computed(() => this.sumar(this.pagadosDelMes()));
  porCobrarMes = computed(() => this.sumar(this.pendientesDelMes()));

  gastosDisponibles = computed(
    () =>
      this.gastosEmpleados() !== null ||
      this.gastosMateriales() !== null ||
      this.gastosOtros() !== null,
  );

  gastosTotales = computed(
    () => (this.gastosEmpleados() ?? 0) + (this.gastosMateriales() ?? 0) + (this.gastosOtros() ?? 0),
  );

  /** Ganancia neta = ingresos - gastos. Solo es confiable cuando hay datos de gastos. */
  gananciaNeta = computed(() => this.ingresosMes() - this.gastosTotales());

  // ---------- Gráficas ----------
  private readonly verde = '#0f6e56';
  private readonly naranja = '#c2410c';
  private readonly gris = '#d1d5db';

  /** Ingresos de los últimos 6 meses (terminando en el mes seleccionado) */
  chartIngresosPorMes = computed(() => {
    const base = this.mes();
    const meses: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      meses.push(new Date(base.getFullYear(), base.getMonth() - i, 1));
    }
    return {
      labels: meses.map((m) => this.nombreMes(m, false)),
      datasets: [
        {
          label: 'Ingresos',
          backgroundColor: this.verde,
          data: meses.map((m) =>
            this.sumar(
              this.pedidos().filter((p) => p.pagado && this.mismoMes(this.fechaIngreso(p), m)),
            ),
          ),
        },
      ],
    };
  });

  /** Pagado vs por cobrar del mes */
  chartCobro = computed(() => ({
    labels: ['Pagado', 'Por cobrar'],
    datasets: [
      {
        data: [this.ingresosMes(), this.porCobrarMes()],
        backgroundColor: [this.verde, this.gris],
      },
    ],
  }));

  /** Gastos del mes por categoría (solo se muestra si hay datos de gastos) */
  chartGastos = computed(() => ({
    labels: ['Empleados', 'Materiales', 'Otros'],
    datasets: [
      {
        data: [this.gastosEmpleados() ?? 0, this.gastosMateriales() ?? 0, this.gastosOtros() ?? 0],
        backgroundColor: [this.naranja, '#f59e0b', '#9ca3af'],
      },
    ],
  }));

  /** Ingresos contra gastos del mes */
  chartIngresosVsGastos = computed(() => ({
    labels: ['Ingresos', 'Gastos', 'Ganancia neta'],
    datasets: [
      {
        data: [this.ingresosMes(), this.gastosTotales(), this.gananciaNeta()],
        backgroundColor: [this.verde, this.naranja, '#7c3aed'],
      },
    ],
  }));

  opcionesBarras = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        // Sin datos, la escala se ve de $0 a $100.000 en vez de $0 a $1 con decimales.
        // Si hay valores más grandes, la escala crece sola.
        suggestedMax: 100000,
        ticks: {
          precision: 0,
          callback: (v: any) => '$' + Number(v).toLocaleString('es-CO'),
        },
      },
    },
  };

  opcionesDona = {
    plugins: { legend: { position: 'bottom' } },
  };

  constructor(private pedidoService: PedidoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.pedidoService.getAll().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(true);
        this.cargando.set(false);
      },
    });

    this.cargarGastos();
  }

  /**
   * PENDIENTE: conectar con el backend.
   * Cuando existan los endpoints de gastos, pedir aquí los montos del mes seleccionado y hacer:
   *   this.gastosEmpleados.set(montoEmpleados);
   *   this.gastosMateriales.set(montoMateriales);
   *   this.gastosOtros.set(montoOtros);
   * Mientras no se llame, el dashboard muestra "Sin datos" en los gastos.
   */
  private cargarGastos(): void {
    // Intencionalmente vacío por ahora.
  }

  // ---------- Navegación entre meses ----------
  mesAnterior(): void {
    const m = this.mes();
    this.mes.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
    this.cargarGastos();
  }

  mesSiguiente(): void {
    if (this.esMesActual()) {
      return;
    }
    const m = this.mes();
    this.mes.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
    this.cargarGastos();
  }

  // ---------- Utilidades ----------
  private fechaIngreso(p: Pedido): Date {
    return new Date(p.fechaPago ?? p.fechaPedido);
  }

  private sumar(lista: Pedido[]): number {
    return lista.reduce((acc, p) => acc + (p.total ?? 0), 0);
  }

  private inicioDeMes(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  private mismoMes(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  private nombreMes(d: Date, conAnio: boolean): string {
    const texto = d.toLocaleDateString('es-CO', conAnio ? { month: 'long', year: 'numeric' } : { month: 'short' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
