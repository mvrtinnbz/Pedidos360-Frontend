import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-failed',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <h2>No se pudo iniciar sesión</h2>
          <p class="subtitle">Ocurrió un problema al autenticarte con Microsoft. Intenta nuevamente.</p>
        </div>
        <div class="login-body">
          <a routerLink="/login" class="btn-primary">Volver a intentar</a>
        </div>
      </div>
    </div>
  `
})
export class LoginFailed {}