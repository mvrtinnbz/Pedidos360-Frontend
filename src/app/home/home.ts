import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  constructor(private msalService: MsalService) {}

  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount();

    if (account) {
      console.log('Cuenta autenticada:', account);
    }

    this.obtenerToken();
  }

  obtenerToken(): void {

    const account =
      this.msalService.instance.getActiveAccount();

    if (!account) {
      console.error('No hay una cuenta activa.');
      return;
    }

    this.msalService.acquireTokenSilent({
      scopes: [
        'api://9415422a-7394-44ca-a7fb-911e767844a8/access_as_user'
      ],
      account: account
    }).subscribe({

      next: (response) => {

        console.log('Access Token obtenido correctamente');
        console.log('Token:', response.accessToken);

        const payload = this.decodificarToken(
          response.accessToken
        );

        console.log('Claims del JWT:', payload);

      },

      error: (error) => {
        console.error(
          'Error obteniendo el Access Token:',
          error
        );
      }

    });
  }

  private decodificarToken(token: string): any {

    const partes = token.split('.');

    if (partes.length !== 3) {
      return null;
    }

    const payload = partes[1];

    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(
          (char) =>
            '%' +
            ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join('')
    );

    return JSON.parse(jsonPayload);
  }
}