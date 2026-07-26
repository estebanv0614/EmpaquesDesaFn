import { Component } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { Router } from "@angular/router";
import { Carousel } from '../../components/carousel/carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeImportsModule, Carousel],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(
    public router: Router
  ){}

  irASolicitarCotizacion(): void {
    this.router.navigate(['/solicitud-nueva']);
  }
}
