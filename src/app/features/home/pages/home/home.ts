import { Component, OnInit, signal, computed } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { Router } from '@angular/router';
import { Carousel } from '../../components/carousel/carousel';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { Videos } from '../../components/videos/videos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeImportsModule, Carousel, Videos],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  bolsas = signal<Bolsa[]>([]);
  loadingBolsas = signal(false);

  constructor(
    public router: Router,
    private bolsaService: BolsaService,
  ) {}

  ngOnInit(): void {
  }

  irASolicitarCotizacion(): void {
    this.router.navigate(['/solicitud-nueva']);
  }
}
