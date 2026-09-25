import { Component, OnInit, signal } from '@angular/core';
import { WhatsappService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
})
export class WhatsappButton implements OnInit {

  nombreEmpresa = 'Empaques DESA Colombia';
  mensajeSaludo = '¡¡Hola!! Queremos hablar contigo, haz click aquí y contáctanos.';
  mensajeRespuesta = 'Nuestro equipo responde usualmente en pocos minutos.';

  mostrarTooltip = signal(false);
  mostrarTarjeta = signal(false);

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.mostrarTooltip.set(true);
    }, 2000);
  }

  get whatsappUrl(): string {
    return this.whatsappService.whatsappUrl;
  }

  toggleTarjeta(): void {
  this.mostrarTarjeta.update(v => !v);

  if (this.mostrarTarjeta()) {
    this.mostrarTooltip.set(false);
  } else {
    this.mostrarTooltip.set(true);
  }
}

  cerrarTarjeta(): void {
    this.mostrarTarjeta.set(false);
  }

  abrirWhatsapp(): void {
    this.whatsappService.abrirWhatsapp();
  }
}
