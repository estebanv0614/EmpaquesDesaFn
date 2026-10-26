import { Component, signal, Input, computed } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { PedidoService } from '../../../../core/services/pedido.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-exportar-button',
  standalone: true,
  imports: [PrimeImportsModule],
  templateUrl: './exportar-button.html',
  styleUrl: './exportar-button.css',
})
export class ExportarButton {
  @Input() fechaDesde: Date | null = null;

  exportando = signal(false);
  mes = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  anio = signal(new Date().getFullYear());

  etiquetaMes = computed(() => this.nombreMes(this.mes()));

  esMesActual = computed(() => {
    const hoy = new Date();
    const m = this.mes();
    return m.getFullYear() === hoy.getFullYear() && m.getMonth() === hoy.getMonth();
  });

  esAnioActual = computed(() => this.anio() >= new Date().getFullYear());

  constructor(
    private pedidoService: PedidoService,
    private messageService: MessageService,
  ) {}

  mesAnterior(): void {
    const m = this.mes();
    this.mes.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  mesSiguiente(): void {
    if (this.esMesActual()) return;
    const m = this.mes();
    this.mes.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  anioAnterior(): void {
    this.anio.update((a) => a - 1);
  }

  anioSiguiente(): void {
    if (this.esAnioActual()) return;
    this.anio.update((a) => a + 1);
  }

  exportar(periodo: 'semana' | 'mes' | 'anio'): void {
    let base: Date;
    if (periodo === 'mes') base = this.mes();
    else if (periodo === 'anio') base = new Date(this.anio(), 0, 1);
    else base = new Date();

    const fechaStr = this.formatear(base);
    this.exportando.set(true);
    this.pedidoService.exportarExcel(periodo, fechaStr).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedidos_${periodo}_${fechaStr}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.exportando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo exportar',
        });
      },
    });
  }

  private nombreMes(d: Date): string {
    const texto = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  private formatear(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
  }
}
