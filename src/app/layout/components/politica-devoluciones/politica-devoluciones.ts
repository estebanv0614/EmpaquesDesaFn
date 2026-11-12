import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider'; // <--- Importa el módulo de PrimeNG

@Component({
  selector: 'app-politica-devoluciones',
  standalone: true,
  imports: [CommonModule, DividerModule], // <--- Agrégalo aquí en los imports
  templateUrl: './politica-devoluciones.html',
  styleUrl: './politica-devoluciones.css'
})
export class PoliticaDevolucionesComponent { }
