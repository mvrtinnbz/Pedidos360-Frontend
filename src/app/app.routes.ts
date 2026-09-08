import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home').then((m) => m.Home)
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./pages/productos').then((m) => m.Productos)
  },
  {
    path: 'carrito',
    loadComponent: () =>
      import('./pages/carrito').then((m) => m.Carrito)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login').then((m) => m.Login)
  },
  {
    path: '**',
    redirectTo: ''
  }
];