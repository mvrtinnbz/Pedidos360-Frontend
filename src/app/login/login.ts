import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  constructor(private msalService: MsalService) {}

  iniciarSesion(): void {
    this.msalService.loginRedirect();
  }

  cerrarSesion(): void {
    this.msalService.logoutRedirect();
  }
}