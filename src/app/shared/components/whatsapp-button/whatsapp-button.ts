import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
})
export class WhatsappButton implements OnInit {
  telefono = '573108612970';
  nombreEmpresa = 'Empaques DESA Colombia';
  mensajeSaludo = '¡¡Hola!! Queremos hablar contigo, haz click aquí y contáctanos.';
  mensajeRespuesta = 'Nuestro equipo responde usualmente en pocos minutos.';
  mensajeWhatsapp = 'Hola, quiero más información sobre sus productos';

  mostrarTooltip = signal(false);
  mostrarTarjeta = signal(false);

  ngOnInit(): void {
    setTimeout(() => {
      this.mostrarTooltip.set(true);
    }, 2000);
  }

  get whatsappUrl(): string {
    return `https://wa.me/${this.telefono}?text=${encodeURIComponent(this.mensajeWhatsapp)}`;
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
    window.open(this.whatsappUrl, '_blank');
  }
}
