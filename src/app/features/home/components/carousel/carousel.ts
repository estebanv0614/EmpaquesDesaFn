import { Component, signal } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';

interface Banner {
  imagen: string;
  titulo: string;
  descripcion: string;
}

export interface PromoBadge {
  texto: string;
  resultado: string;
  nota?: string;
}

export interface Banners {
  tituloLinea1: string;
  tituloLinea2: string;
  subtitulo: string;
  descripcion: string;
  promos: PromoBadge[];
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [PrimeImportsModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
})
export class Carousel {
  banners = signal<Banner[]>([
    {
      imagen: 'assets/images/bolsa6.png',
      titulo: 'Empaques que protegen tu producto',
      descripcion: 'Bolsas de alta calidad para tu negocio'
    },
    {
      imagen: 'assets/images/bolsa1.png',
      titulo: 'Impresión personalizada',
      descripcion: 'Dale identidad a tu marca con nuestros diseños'
    },
    {
      imagen: 'assets/images/prueba2.png',
      titulo: 'Entrega rápida y confiable',
      descripcion: 'Plazos de 10 a 15 días hábiles'
    },
  ]);

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];


  items = [1, 2, 3, 4, 5];
}
