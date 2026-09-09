import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <!-- Alerta Flotante Global (Toast) -->
    @if (authService.alerta(); as alerta) {
      <div class="toast-notification" [ngClass]="alerta.tipo === 'success' ? 'toast-success' : 'toast-info'">
        <span>{{ alerta.tipo === 'success' ? '✅' : 'ℹ️' }}</span>
        <span>{{ alerta.mensaje }}</span>
      </div>
    }

    <header class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-logo">Pedidos360</a>
        <nav class="nav-links">
          <a routerLink="/productos" class="nav-link">Productos</a>
          <a routerLink="/carrito" class="nav-link">Carrito</a>
          
          @if (authService.isLoggedIn()) {
            <a routerLink="/login" class="btn-login-nav session-active">Sesión iniciada</a>
          } @else {
            <a routerLink="/login" class="btn-login-nav">Iniciar Sesión</a>
          }
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
  public authService = inject(AuthService);
  private msalService = inject(MsalService);

  ngOnInit(): void {
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          this.msalService.instance.setActiveAccount(result.account);
          this.authService.actualizarEstado();
          this.authService.mostrarNotificacion('¡Inicio de sesión exitoso!', 'success');
        }
      },
      error: () => this.authService.actualizarEstado()
    });
  }
}