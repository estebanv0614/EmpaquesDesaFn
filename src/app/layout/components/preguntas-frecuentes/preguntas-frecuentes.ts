import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-preguntas-frecuentes',
  standalone: true,
  imports: [AccordionModule],
  templateUrl: './preguntas-frecuentes.html',
  styleUrl: './preguntas-frecuentes.css',
})
export class PreguntasFrecuentes {}