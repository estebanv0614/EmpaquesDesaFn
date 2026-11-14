import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider'; 

@Component({
  selector: 'app-politica-devoluciones',
  standalone: true,
  imports: [CommonModule, DividerModule],
  templateUrl: './politica-devoluciones.html',
  styleUrl: './politica-devoluciones.css'
})
export class PoliticaDevoluciones { }
