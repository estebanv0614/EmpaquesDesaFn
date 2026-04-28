import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Layout } from './layout/layout/layout';
import { Login } from './features/auth/pages/login/login';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: Home
      }
    ]
  },
  {
    path: 'login',
    component: Login
  }
];
