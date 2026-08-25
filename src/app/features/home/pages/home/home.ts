import { Component, OnInit, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { Router } from '@angular/router';
import { Carousel } from '../../components/carousel/carousel';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { Bolsa } from '../../../../shared/models/bolsa.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeImportsModule, Carousel, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  bolsas = signal<Bolsa[]>([]);
  loadingBolsas = signal(false);

  // Se muestran solo las bolsas activas en el catálogo público
  bolsasActivas = computed(() =>
    this.bolsas().filter((b) => !b.estado || b.estado?.name === 'ACTIVO'),
  );

  // Imágenes de respaldo mientras el backend no tenga foto por producto
  private readonly imagenesRespaldo = [
    'assets/images/bolsa1.png',
    'assets/images/bolsa2.png',
    'assets/images/bolsa3.png',
    'assets/images/bolsa6.png',
    'assets/images/bolsaSinFondo.png',
  ];

  constructor(
    public router: Router,
    private bolsaService: BolsaService,
  ) {}

  ngOnInit(): void {
    this.loadingBolsas.set(true);
    this.bolsaService.getAll().subscribe({
      next: (data) => {
        this.bolsas.set(data);
        this.loadingBolsas.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loadingBolsas.set(false);
      },
    });
  }

  imagenBolsa(index: number): string {
    return this.imagenesRespaldo[index % this.imagenesRespaldo.length];
  }

  irASolicitarCotizacion(): void {
    this.router.navigate(['/solicitud-nueva']);
  }

  // Al seleccionar una bolsa del catálogo, se envía a la solicitud de cotización
  // con el producto ya prellenado.
  seleccionarBolsa(bolsa: Bolsa): void {
    this.router.navigate(['/solicitud-nueva'], {
      state: { producto: bolsa.tipo, bolsaId: bolsa.id },
    });
  }
}
