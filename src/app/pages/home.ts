import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="home-container">
      <!-- Hero Banner -->
      <section class="hero-card">
        <span class="badge">Plataforma de Gestión</span>
        <h1 class="hero-title">Gestión de Pedidos en Tiempo Real</h1>
        <p class="hero-subtitle">
          Bienvenido a <strong>Pedidos360</strong>. Explora nuestro catálogo de productos, administra tu carrito de compras y procesa órdenes de forma ágil y segura.
        </p>
        
        <div class="hero-actions">
          <a routerLink="/productos" class="btn-primary">Ver Catálogo</a>
          <a routerLink="/carrito" class="btn-secondary">Ir al Carrito</a>
        </div>
      </section>

      <!-- Grid de Accesos Rápidos -->
      <section class="features-grid">
        <div class="feature-card">
          <div class="card-icon">📦</div>
          <h3>Catálogo de Productos</h3>
          <p>Revisa el listado completo de artículos disponibles con información detallada de stock y precios.</p>
          <a routerLink="/productos" class="card-link">Explorar catálogo &rarr;</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">🛒</div>
          <h3>Carrito de Compras</h3>
          <p>Gestiona los productos añadidos, modifica cantidades y revisa el desglose total de tu orden.</p>
          <a routerLink="/carrito" class="card-link">Ver mi carrito &rarr;</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">🔐</div>
          <h3>Seguridad y Sesión</h3>
          <p>Accede al portal de autenticación mediante Microsoft Entra ID de forma rápida y segura.</p>
          <a routerLink="/login" class="card-link">Ir a inicio de sesión &rarr;</a>
        </div>
      </section>
    </div>
  `
})
export class Home {}