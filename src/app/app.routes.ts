import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    loadComponent: () =>
      import('./home/home').then(
        (m) => m.Home
      )
  }
];