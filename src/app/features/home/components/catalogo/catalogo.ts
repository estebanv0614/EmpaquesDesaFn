import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [PrimeImportsModule, CommonModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  productos = signal<Bolsa[]>([]);
  cargando = signal(true);

  constructor(
    private bolsaService: BolsaService,
    public router: Router
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
