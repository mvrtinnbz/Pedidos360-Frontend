import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.spec';

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
        <a routerLink="/" class="nav-logo">
          <img src="logo.png" alt="Logo FullSport360" class="nav-logo-img" />
          FullSport360
        </a>
        <nav class="nav-links">
          <a routerLink="/productos" class="nav-link">Productos</a>
          <a routerLink="/dashboard" class="nav-link">Dashboard</a>

          @if (authService.isLoggedIn()) {
            <a routerLink="/perfil" class="nav-link">Mi Perfil</a>
            <a routerLink="/ordenes" class="nav-link">Mis Órdenes</a>
            <a routerLink="/facturas" class="nav-link">Mis Facturas</a>
          }

          <a routerLink="/carrito" class="nav-cart" [class.bump]="carritoAnimando()" aria-label="Carrito">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            @if (cartService.cantidadTotal() > 0) {
              <span class="cart-badge">{{ cartService.cantidadTotal() }}</span>
            }
          </a>

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

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-container">

        <div class="footer-col footer-marca">
          <span class="footer-logo">FullSport360</span>
          <p>
            Indumentaria, calzado y accesorios deportivos para llevar
            tu entrenamiento al siguiente nivel.
          </p>
          <p class="footer-aviso">
            Tienda ficticia desarrollada como proyecto académico.
          </p>
        </div>

        <div class="footer-col">
          <h4>Tienda</h4>
          <a routerLink="/productos">Productos</a>
          <a routerLink="/carrito">Carrito</a>
          @if (authService.isLoggedIn()) {
            <a routerLink="/ordenes">Mis Órdenes</a>
            <a routerLink="/facturas">Mis Facturas</a>
          }
        </div>

        <div class="footer-col">
          <h4>Información</h4>
          <span>Envíos y despachos</span>
          <span>Cambios y devoluciones</span>
          <span>Términos y condiciones</span>
        </div>

        <div class="footer-col">
          <h4>Contacto</h4>
          <span>fullsport360.tienda&#64;gmail.com</span>
          <span>Av. Deportiva 360, Santiago</span>
          <span>Lunes a viernes, 9:00 a 18:00</span>
        </div>

      </div>

      <div class="footer-inferior">
        <span>© {{ anioActual }} FullSport360 · Proyecto académico Pedidos360</span>
        <span class="footer-tecnologias">
          Angular · Spring Boot · RabbitMQ · AWS · Azure Entra ID
        </span>
      </div>
    </footer>
  `
})
export class App implements OnInit {
  protected readonly title = signal('pedidos360');
  protected readonly anioActual = new Date().getFullYear();
  public authService = inject(AuthService);
  private msalService = inject(MsalService);

  // Carrito: contador en la barra de navegación y animación
  protected cartService = inject(CartService);
  protected carritoAnimando = signal(false);
  private cantidadPrevia = this.cartService.cantidadTotal();

  constructor() {
    // Anima el carrito cada vez que aumenta la cantidad
    effect(() => {
      const cantidad = this.cartService.cantidadTotal();
      if (cantidad > this.cantidadPrevia) {
        this.carritoAnimando.set(true);
        setTimeout(() => this.carritoAnimando.set(false), 600);
      }
      this.cantidadPrevia = cantidad;
    });
  }

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