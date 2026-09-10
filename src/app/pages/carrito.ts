import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { CartService } from '../services/cart.spec';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="cart-container">
      <h2>Tu Carrito de Compras</h2>
      <p class="subtitle">Revisa los artículos seleccionados antes de procesar la orden.</p>

      <div class="cart-layout">
        <div class="cart-items">
          @for (item of cartService.items(); track item.producto.id) {
            <div class="cart-item-card">
              <img [src]="item.producto.imagen" class="item-img" alt="{{ item.producto.nombre }}" />
              <div class="item-info">
                <h3>{{ item.producto.nombre }}</h3>
                <p class="item-price">{{ item.producto.precio | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</p>
              </div>

              <div class="quantity-controls">
                <button (click)="cartService.cambiarCantidad(item.producto.id, -1)">-</button>
                <span>{{ item.cantidad }}</span>
                <button (click)="cartService.cambiarCantidad(item.producto.id, 1)">+</button>
              </div>

              <button class="btn-remove" (click)="cartService.eliminar(item.producto.id)">Quitar</button>
            </div>
          } @empty {
            <div class="empty-cart">
              <p>El carrito está vacío.</p>
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
            <span class="text-success">Gratis</span>
          </div>

          <hr />

          <div class="summary-row total-row">
            <strong>Total</strong>
            <strong>{{ cartService.total() | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</strong>
          </div>

          <button class="btn-checkout" (click)="procesarPedido()">
            Procesar Pedido
          </button>
        </div>
      </div>
    </div>

    @if (mostrarModalLogin) {
      <div class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon">🔒</div>
          <h3>Inicio de Sesión Requerido</h3>
          <p>Para continuar con el proceso de pago y completar tu compra, necesitas iniciar sesión con tu cuenta.</p>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button class="btn-primary" (click)="iniciarSesionYContinuar()">Iniciar Sesión</button>
          </div>
        </div>
      </div>
    }

    @if (mostrarModalVacio) {
      <div class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon">🛒</div>
          <h3>Carrito Vacío</h3>
          <p>Aún no has agregado productos. Ve al catálogo y elige algo antes de procesar el pedido.</p>
          <div class="modal-actions modal-actions-single">
            <button class="btn-primary" (click)="cerrarModalVacio()">Entendido</button>
          </div>
        </div>
      </div>
    }

    @if (mostrarModalExito) {
      <div class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon text-success">✅</div>
          <p>Pedido procesado y guardado correctamente.</p>
          <div class="modal-actions modal-actions-single">
            <button class="btn-primary" (click)="cerrarModalExito()">Aceptar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class Carrito {
  protected cartService = inject(CartService);
  private carritoService = inject(CarritoService);
  private msalService = inject(MsalService);

  mostrarModalLogin = false;
  mostrarModalExito = false;
  mostrarModalVacio = false;

  procesarPedido(): void {
    if (this.cartService.items().length === 0) {
      this.mostrarModalVacio = true;
      return;
    }

    const account = this.msalService.instance.getActiveAccount();

    if (!account) {
      this.mostrarModalLogin = true;
      return;
    }

    this.sincronizarConBackend(account.username);
  }

  sincronizarConBackend(usuarioId: string): void {
    const items = this.cartService.items();

    items.forEach(item => {
      this.carritoService.agregar({
        usuarioId,
        productoId: item.producto.id,
        nombreProducto: item.producto.nombre,
        precioUnitario: item.producto.precio,
        cantidad: item.cantidad
      }).subscribe({
        error: (err) => console.error('Error guardando item en el carrito:', err)
      });
    });

    this.cartService.limpiar();
    this.mostrarModalExito = true;
  }

  iniciarSesionYContinuar(): void {
    this.mostrarModalLogin = false;
    for (const key of Object.keys(sessionStorage)) {
      if (key.includes('msal')) sessionStorage.removeItem(key);
    }
    this.msalService.loginRedirect({ scopes: ['user.read', 'openid', 'profile'] });
  }

  cerrarModal(): void { this.mostrarModalLogin = false; }
  cerrarModalExito(): void { this.mostrarModalExito = false; }
  cerrarModalVacio(): void { this.mostrarModalVacio = false; }
}