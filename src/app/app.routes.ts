import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then(
        (m) => m.Login
      )
  },

  {
    path: '',
    canActivate: [MsalGuard],
    loadComponent: () =>
      import('./home/home').then(
        (m) => m.Home
      )
  },

  {
    path: '**',
    redirectTo: ''
  }

];