import { Component } from '@angular/core';
import { PrimeImportsModule } from '../../../prime-imports/prime-imports-module';
import { AvatarModule } from 'primeng/avatar';
import { WhatsappService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [PrimeImportsModule, AvatarModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  constructor(private whatsappService: WhatsappService) {}

  abrirWhatsapp(): void {
    this.whatsappService.abrirWhatsapp();
  }

  abrirWhatsapp1(): void {
    this.whatsappService.abrirWhatsapp1();
  }
}
