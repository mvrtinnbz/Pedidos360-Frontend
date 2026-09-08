import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-logo">Pedidos360</a>
        <nav class="nav-links">
          <a routerLink="/productos" class="nav-link">Productos</a>
          <a routerLink="/carrito" class="nav-link">Carrito</a>
          <a routerLink="/login" class="btn-login-nav">Iniciar Sesión</a>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `
})
export class App implements OnInit {
  protected readonly title = signal('pedidos360');

  constructor(private msalService: MsalService) {}

  ngOnInit(): void {
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          console.log('Login exitoso:', result);
          this.msalService.instance.setActiveAccount(result.account);
        }
      },
      error: (error) => {
        console.error('Error de autenticación MSAL:', error);
      }
    });
  }
}