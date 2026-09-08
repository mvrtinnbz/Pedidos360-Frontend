import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.spec';

@Component({
  selector: 'app-carrito',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Tu Carrito de Compras</h1>
        <p>Revisa los artículos seleccionados antes de procesar la orden.</p>
      </div>

      @if (cartService.items().length > 0) {
        <div class="cart-layout">
          <div class="cart-items-list">
            @for (item of cartService.items(); track item.producto.id) {
              <div class="cart-item-card">
                <div class="cart-item-icon">{{ item.producto.imagen }}</div>
                
                <div class="cart-item-details">
                  <span class="category-badge">{{ item.producto.categoria }}</span>
                  <h4>{{ item.producto.nombre }}</h4>
                  <p class="unit-price">{{ item.producto.precio | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }} c/u</p>
                </div>

                <div class="quantity-controls">
                  <button (click)="cartService.cambiarCantidad(item.producto.id, -1)">-</button>
                  <span>{{ item.cantidad }}</span>
                  <button (click)="cartService.cambiarCantidad(item.producto.id, 1)">+</button>
                </div>

                <div class="cart-item-subtotal">
                  <p>{{ (item.producto.precio * item.cantidad) | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</p>
                  <button class="btn-delete" (click)="cartService.eliminar(item.producto.id)">Quitar</button>
                </div>
              </div>
            }
          </div>

          <div class="cart-summary-card">
            <h3>Resumen de la Orden</h3>
            <div class="summary-row">
              <span>Subtotal ({{ cartService.cantidadTotal() }} items)</span>
              <span>{{ cartService.total() | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</span>
            </div>
            <div class="summary-row">
              <span>Envío estimado</span>
              <span class="free-shipping">Gratis</span>
            </div>
            <hr class="summary-divider" />
            <div class="summary-row total-row">
              <span>Total</span>
              <span>{{ cartService.total() | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</span>
            </div>

            <button class="btn-primary btn-checkout" (click)="procesarOrden()">
              Procesar Pedido
            </button>
          </div>
        </div>
      } @else {
        <div class="empty-cart-card">
          <div class="empty-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Explora nuestro catálogo para añadir indumentaria deportiva.</p>
          <a routerLink="/productos" class="btn-primary">Ver Productos</a>
        </div>
      }
    </div>
  `
})
export class Carrito {
  cartService = inject(CartService);

  procesarOrden(): void {
    alert('Orden procesada con éxito. (Mock)');
    this.cartService.limpiar();
  }
}