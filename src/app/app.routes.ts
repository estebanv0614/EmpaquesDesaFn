import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Layout } from './layout/layout/layout';
import { Login } from './features/auth/pages/login/login';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: Home
      },
      {
        path: 'persons',
        loadComponent: () => import('./features/person/pages/person-list/person-list').then(m => m.PersonList)
      }
    ]
  },
  {
    path: 'login',
    component: Login
  }
];

console.log('RUTAS CARGADAS:', routes);
