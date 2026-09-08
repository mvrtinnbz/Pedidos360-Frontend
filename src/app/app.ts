import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <!-- Alerta Flotante Global (Toast) -->
    @if (mensajeAlerta) {
      <div class="toast-notification" [ngClass]="tipoAlerta === 'success' ? 'toast-success' : 'toast-info'">
        <span>{{ tipoAlerta === 'success' ? '✅' : 'ℹ️' }}</span>
        <span>{{ mensajeAlerta }}</span>
      </div>
    }

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

  mensajeAlerta: string | null = null;
  tipoAlerta: 'success' | 'info' = 'success';

  constructor(
    private msalService: MsalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Revisar si venimos de un cierre de sesión previo
    if (localStorage.getItem('app_logout_success') === 'true') {
      localStorage.removeItem('app_logout_success');
      this.mostrarNotificacion('La sesión se ha cerrado correctamente.', 'info');
    }

    // 2. Escuchar la respuesta del inicio de sesión de MSAL
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          this.msalService.instance.setActiveAccount(result.account);
          this.mostrarNotificacion('¡Inicio de sesión exitoso!', 'success');
        }
      },
      error: (error) => {
        console.error('Error de autenticación MSAL:', error);
      }
    });
  }

  mostrarNotificacion(mensaje: string, tipo: 'success' | 'info'): void {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mensajeAlerta = null;
      this.cdr.detectChanges();
    }, 3500);
  }
}