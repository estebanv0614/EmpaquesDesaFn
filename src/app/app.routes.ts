import { Routes } from '@angular/router';

import { Home } from './features/home/pages/home/home';
import { Layout } from './layout/layout/layout';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './core/guards/auth-guard';

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
        path: 'solicitudes-cotizacion/:id/convertir',
        canActivate: [authGuard],
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
      }
    ],
  },
  {
    path: 'login',
    component: Login,
  },
];
