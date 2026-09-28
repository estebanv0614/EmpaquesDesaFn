import { Component, OnInit, signal } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { Router } from '@angular/router';
import { Carousel } from '../../components/carousel/carousel';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { Videos } from '../../components/videos/videos';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeImportsModule, Carousel, Videos, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  productos = signal<Bolsa[]>([]);
  cargando = signal(true);

  constructor(
    public router: Router,
    private bolsaService: BolsaService,
  ) {}

  ngOnInit(): void {
    this.bolsaService.getPublicoCatalogo().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el catálogo', err);
        this.cargando.set(false);
      }
    });
  }

  irASolicitarCotizacion(): void {
    this.router.navigate(['/solicitud-nueva']);
  }

  getImagen(item: Bolsa): string {
    return this.bolsaService.getImagenUrl(item.imagenUrl);
  }
}
