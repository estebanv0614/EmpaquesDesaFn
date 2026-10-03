import { Routes } from '@angular/router';

import { Home } from './features/home/pages/home/home';
import { Layout } from './layout/layout/layout';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './core/guards/auth-guard';
import { convertirSolicitudGuard } from './convertir-solicitud-guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'persons',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/person/pages/person-list/person-list').then((m) => m.PersonList),
      },
      {
        path: 'solicitudes-cotizacion',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/solicitud/pages/solicitud-list/solicitud-list').then(
            (s) => s.SolicitudList,
          ),
      },
      {
        path: 'solicitud-nueva',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./features/solicitud/pages/solicitud-form/solicitud-form').then(
            (so) => so.SolicitudForm,
          ),
      },
      {
        path: 'catalago',
        //canActivate: [authGuard],
        loadComponent: () => import('./features/home/components/catalogo/catalogo').then(cl => cl.Catalogo)
      },
      // LAYOUT
      {
        path: 'nosotros',
        loadComponent: () => import('./layout/components/acerca-de-nosotros/acerca-de-nosotros').then(adn => adn.AcercaDeNosotros)
      },
      {
        path: 'nuestro-equipo',
        loadComponent: () =>
        import('./layout/components/nuestro-equipo/nuestro-equipo').then((m) => m.NuestroEquipo),
      },
      {
        path: 'resenas-clientes',
        loadComponent: () =>
        import('./layout/components/resenas-clientes/resenas-clientes').then((m) => m.ResenasClientes),
      },
      {
       path: 'cotizaciones-mayoristas',
       loadComponent: () =>
      import('./layout/components/cotizaciones-mayoristas/cotizaciones-mayoristas').then((m) => m.CotizacionesMayoristas),
      },
         {
       path: 'preguntas-frecuentes',
       loadComponent: () =>
       import('./layout/components/preguntas-frecuentes/preguntas-frecuentes').then((m) => m.PreguntasFrecuentes),
      }, 
      {
       path: 'accesibilidad',
       loadComponent: () =>
       import('./layout/components/accesibilidad/accesibilidad').then((m) => m.Accesibilidad),
      },
      {
       path: 'politica-devoluciones',
       loadComponent: () =>
       import('./layout/components/politica-devoluciones/politica-devoluciones').then((m) => m.PoliticaDevoluciones),
      },
      {
       path: 'politica-reembolsos',
       loadComponent: () =>
       import('./layout/components/politica-reembolsos/politica-reembolsos').then((m) => m.PoliticaReembolsos),
      },  
      {
        path: 'solicitudes-cotizacion/:id/convertir',
        canActivate: [authGuard, convertirSolicitudGuard],
        loadComponent: () =>
        import('./features/solicitud/pages/solicitud-convertir/solicitud-convertir').then(
            (m) => m.SolicitudConvertir,
          ),
       },
       {
        path: 'bolsas',
        canActivate: [authGuard],
        loadComponent: () => import('./features/productos/pages/bolsa-list/bolsa-list').then(b => b.BolsaList)
      },
      {
        path: 'form-bolsa',
        canActivate: [authGuard],
        loadComponent: () => import('./features/productos/pages/bolsa-form/bolsa-form').then(bf => bf.BolsaForm)
      },
      {
        path: 'mis-pedidos',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pedidos/pages/mis-pedidos/mi-pedido').then(mp => mp.MiPedidoList)
      },
      {
        path: 'pedidos',
        canActivate: [authGuard],
        loadComponent: () => import('./features/pedidos/pages/pedido-list/pedido-list').then(m => m.PedidoList)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./shared/components/contacto/contacto').then(co => co.Contacto)
      }
    ],
  },
  {
    path: 'login',
    component: Login,
  },
];
