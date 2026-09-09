import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <span class="brand-badge">🔑 Acceso Seguro</span>
          <h2>Acceso a Pedidos360</h2>
          <p class="subtitle">
            @if (authService.isLoggedIn()) {
              Tienes una sesión activa en la aplicación.
            } @else {
              Inicia sesión con tu cuenta corporativa para explorar el catálogo y gestionar tus órdenes.
            }
          </p>
        </div>

        <div class="login-body">
          @if (!authService.isLoggedIn()) {
            <!-- Muestra el botón de Iniciar Sesión solo si NO hay usuario -->
            <button class="btn-microsoft-large" (click)="iniciarSesion()">
              <svg width="22" height="22" viewBox="0 0 23 23" fill="none">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>Iniciar sesión con Microsoft</span>
            </button>
          } @else {
            <!-- Muestra el botón de Cerrar Sesión solo si SÍ hay usuario -->
            <button class="btn-outline-danger btn-logout-full" (click)="cerrarSesionLocal()">
              Cerrar Sesión
            </button>
          }
        </div>

        <div class="login-footer">
          <p>🔒 Autenticación protegida por <strong>Microsoft Entra ID</strong></p>
        </div>
      </div>
    </div>
  `
})
export class Login implements OnInit {
  public authService = inject(AuthService);
  private msalService = inject(MsalService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result?.account) {
          this.msalService.instance.setActiveAccount(result.account);
        }
        this.verificarEstadoSesion();
      },
      error: () => this.verificarEstadoSesion()
    });

    this.verificarEstadoSesion();
  }

  verificarEstadoSesion(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    const allAccounts = this.msalService.instance.getAllAccounts();

    if (!activeAccount && allAccounts.length > 0) {
      this.msalService.instance.setActiveAccount(allAccounts[0]);
    }

    this.authService.actualizarEstado();
    this.cdr.detectChanges();
  }

  iniciarSesion(): void {
    sessionStorage.removeItem('msal.interaction.status');
    this.msalService.loginRedirect({
      scopes: ['user.read', 'openid', 'profile']
    });
  }

  cerrarSesionLocal(): void {
    this.msalService.instance.setActiveAccount(null);
    sessionStorage.clear();
    localStorage.clear();

    // Actualiza estado y dispara la alerta flotante en tiempo real
    this.authService.actualizarEstado();
    this.authService.mostrarNotificacion('La sesión se ha cerrado correctamente.', 'info');
    this.cdr.detectChanges();
  }
}