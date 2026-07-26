import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
})
export class WhatsappButton {
  telefono = '573007811531';
  mensaje = 'Hola, quiero más información sobre sus productos';

  get whatsappUrl(): string {
    return `https://wa.me/${this.telefono}?text=${encodeURIComponent(this.mensaje)}`;
  }
}
