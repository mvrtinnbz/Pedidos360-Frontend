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
    path: 'productos/:id',
    loadComponent: () =>
      import('./pages/producto-detalle').then((m) => m.ProductoDetalle)
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
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil').then((m) => m.Perfil)
  },
  {
    path: 'login-failed',
    loadComponent: () =>
      import('./pages/login-failed').then((m) => m.LoginFailed)
  },
  {
    path: '**',
    redirectTo: ''
  }
];