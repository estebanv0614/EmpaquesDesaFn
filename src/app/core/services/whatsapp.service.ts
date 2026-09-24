import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  private telefono1 = '573213826385'
  private telefono = '573108612970';

  private mensajeWhatsapp =
    'Hola, quiero más información sobre sus productos';

  
  get whatsappUrl1(): string {
    return `https://wa.me/${this.telefono1}?text=${encodeURIComponent(this.mensajeWhatsapp)}`;
  }
  get whatsappUrl(): string {
    return `https://wa.me/${this.telefono}?text=${encodeURIComponent(this.mensajeWhatsapp)}`;
  }

  abrirWhatsapp(): void {
    window.open(this.whatsappUrl, '_blank');
  }
  abrirWhatsapp1(): void {
    window.open(this.whatsappUrl1, '_blank');
  } 
}