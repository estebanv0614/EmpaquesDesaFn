import { Component } from '@angular/core';
import { PrimeImportsModule } from '../../../prime-imports/prime-imports-module';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [PrimeImportsModule, AvatarModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {}
