import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [CardModule, DividerModule, ButtonModule],
  templateUrl: './accesibilidad.html',
})
export class Accesibilidad {
  shortcuts = [
    { keys: 'Tab', action: 'Avanzar al siguiente elemento interactivo' },
    { keys: 'Shift + Tab', action: 'Volver al elemento anterior' },
    { keys: 'Enter', action: 'Activar enlaces y botones' },
    { keys: 'Esc', action: 'Cerrar el chat en vivo y otras ventanas' },
  ];

  features = [
    {
      icon: 'pi pi-desktop',
      title: 'Lectores de pantalla',
      text: 'El sitio usa etiquetas y roles ARIA para que NVDA, JAWS o Narrador lean correctamente el contenido.',
    },
    {
      icon: 'pi pi-clone',
      title: 'Navegación por teclado',
      text: 'Todas las secciones, formularios y el chat en vivo se pueden usar sin mouse.',
    },
    {
      icon: 'pi pi-palette',
      title: 'Contraste de color',
      text: 'Los textos y botones cumplen la relación de contraste mínima AA de las pautas WCAG 2.1.',
    },
    {
      icon: 'pi pi-search-plus',
      title: 'Ampliación de texto',
      text: 'Puedes ampliar la página hasta un 200% con el navegador sin perder contenido ni funciones.',
    },
    {
      icon: 'pi pi-pause',
      title: 'Movimiento reducido',
      text: 'Si tu dispositivo tiene activada la opción de reducir animaciones, el sitio la respeta.',
    },
  ];

  openLink(url: string) {
    window.open(url, url.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
  }
}