import { Component, signal, Input } from '@angular/core';
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

  constructor(
    private pedidoService: PedidoService,
    private messageService: MessageService,
  ) {}

  exportar(periodo: 'semana' | 'mes' | 'anio'): void {
    this.exportando.set(true);
    const fechaStr = new Date().toISOString().split('T')[0];

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
}
