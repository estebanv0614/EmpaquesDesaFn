import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { PedidoService } from '../../../../core/services/pedido.service';
import { Pedido } from '../../../../shared/models/pedido.model';
import { GastoOperativoService } from '../../../../core/services/gasto-operativo.service';
import { GastoOperativo } from '../../../../shared/models/gasto-operativo.model';

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

  // ---------- GASTOS (vienen de /gastos-operativos) ----------
  gastosOperativos = signal<GastoOperativo[]>([]);
  gastosCargados = signal(false);

  /** Gastos del mes seleccionado */
  gastosDelMes = computed(() =>
    this.gastosOperativos().filter((g) => this.mismoMes(this.parseFecha(g.fechaGasto), this.mes())),
  );

  /** Gastos con material asociado */
  listaMateriales = computed(() => this.gastosDelMes().filter((g) => this.esMaterial(g)));

  /** Gastos de nómina / salarios (y no de material) */
  listaEmpleados = computed(() =>
    this.gastosDelMes().filter((g) => !this.esMaterial(g) && this.esEmpleado(g)),
  );

  /** El resto de gastos */
  listaOtros = computed(() =>
    this.gastosDelMes().filter((g) => !this.esMaterial(g) && !this.esEmpleado(g)),
  );

  // null = "sin datos todavía" (aún no responde el backend)
  gastosEmpleados = computed<number | null>(() =>
    this.gastosCargados() ? this.sumarGastos(this.listaEmpleados()) : null,
  );
  gastosMateriales = computed<number | null>(() =>
    this.gastosCargados() ? this.sumarGastos(this.listaMateriales()) : null,
  );
  gastosOtros = computed<number | null>(() =>
    this.gastosCargados() ? this.sumarGastos(this.listaOtros()) : null,
  );

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

  constructor(
    private pedidoService: PedidoService,
    private gastoService: GastoOperativoService,
  ) {}

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

  /** Trae todos los gastos operativos; el filtro por mes y la separación se hacen en los computed. */
  private cargarGastos(): void {
    this.gastoService.getAll().subscribe({
      next: (data) => {
        this.gastosOperativos.set(data);
        this.gastosCargados.set(true);
      },
      error: (err) => {
        console.error(err);
        this.gastosCargados.set(false);
      },
    });
  }

  // ---------- Navegación entre meses ----------
  mesAnterior(): void {
    const m = this.mes();
    this.mes.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  mesSiguiente(): void {
    if (this.esMesActual()) {
      return;
    }
    const m = this.mes();
    this.mes.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  // ---------- Utilidades ----------
  private fechaIngreso(p: Pedido): Date {
    return new Date(p.fechaPago ?? p.fechaPedido);
  }

  /** "2026-10-01" se lee como fecha local (new Date() la corre un día por la zona horaria). */
  private parseFecha(s: string): Date {
    const [a, m, d] = (s ?? '').substring(0, 10).split('-').map(Number);
    return new Date(a, (m || 1) - 1, d || 1);
  }

  private normalizar(s?: string | null): string {
    return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  private esMaterial(g: GastoOperativo): boolean {
    return !!g.material;
  }

  private esEmpleado(g: GastoOperativo): boolean {
    return /nomina|salario|sueldo|empleado/.test(this.normalizar(g.tipoGasto?.name));
  }

  private sumarGastos(lista: GastoOperativo[]): number {
    return lista.reduce((acc, g) => acc + (g.monto ?? 0), 0);
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
