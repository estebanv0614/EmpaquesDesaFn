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
      imagen: 'assets/images/foto1.png',
      titulo: 'Empaques que protegen tu producto',
      descripcion: 'Bolsas de alta calidad para tu negocio'
    },
    {
      imagen: 'assets/images/foto2.png',
      titulo: 'Calidad que inspira',
      descripcion: 'Productos elaborados con dedicación y excelentes acabados'
    },
    {
      imagen: 'assets/images/foto3.png',
      titulo: 'Haz crecer tu marca',
     descripcion: 'Dale visibilidad a tu negocio y llega a nuevos clientes'
    },
    {
      imagen: 'assets/images/foto4.png',
      titulo: 'Diseños a tu medida',
      descripcion: 'Creamos soluciones pensadas especialmente para tus necesidades'
    },
     {
      imagen: 'assets/images/foto5.png',
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
