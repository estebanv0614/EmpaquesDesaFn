import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../core/services/auth';

interface EnlaceMenu {
  ruta: string;
  label: string;
  icono: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuAbierto = signal(false);

  private readonly enlacesPersonal: EnlaceMenu[] = [
    { ruta: '/dashboard', label: 'Dashboard', icono: 'pi-chart-line' },
    { ruta: '/solicitudes-cotizacion', label: 'Solicitudes', icono: 'pi-file-pdf' },
    { ruta: '/persons', label: 'Personas', icono: 'pi-users' },
    { ruta: '/bolsas', label: 'Catálogo', icono: 'pi-book' },
    { ruta: '/pedidos', label: 'Pedidos', icono: 'pi-shopping-cart' },
    { ruta: '/gastos', label: 'Gastos', icono: 'pi-credit-card' },
    { ruta: '/nomina', label: 'Nómina', icono: 'pi-money-bill' },
    { ruta: '/material', label: 'Material', icono: 'pi-tags' },
  ];

  private readonly enlacesCliente: EnlaceMenu[] = [
    { ruta: '/mis-pedidos', label: 'Mis Pedidos', icono: 'pi-shopping-cart' },
  ];

  private readonly enlacesPublicos: EnlaceMenu[] = [
    { ruta: '/home', label: 'Inicio', icono: 'pi-home' },
    { ruta: '/catalago', label: 'Catálogo', icono: 'pi-book' },
    { ruta: '/solicitud-nueva', label: 'Solicitar cotización', icono: 'pi-file-edit' },
  ];

  constructor(
    public auth: Auth,
    public router: Router,
  ) {}

  get enlaces(): EnlaceMenu[] {
    if (!this.auth.isLoggedIn()) return this.enlacesPublicos;
    return this.auth.isCliente() ? this.enlacesCliente : this.enlacesPersonal;
  }

  toggleMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  logout(): void {
    this.cerrarMenu();
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
