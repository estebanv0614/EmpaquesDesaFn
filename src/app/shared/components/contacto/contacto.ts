import { Component } from '@angular/core';
import { PrimeImportsModule } from '../../../prime-imports/prime-imports-module';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [PrimeImportsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {}
