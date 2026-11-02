import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CartService } from '../services/cart.spec';
import { CarritoService } from '../services/carrito.service';
import { OrdenService } from '../services/orden.service';
import { PagoService } from '../services/pago.service';

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
              
              <!-- IMAGEN DE PRODUCTO CON TAMAÑO MINIATURA -->
              <img 
                [src]="'/' + item.producto.id + '.jpg'" 
                class="item-img" 
                [alt]="item.producto.nombre" 
                (error)="manejarErrorImagen($event)"
              />

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

          <button class="btn-checkout" (click)="procesarPedido()" [disabled]="procesando">
            {{ procesando ? 'Redirigiendo a Webpay...' : 'Pagar con Webpay' }}
          </button>

          <p class="pago-nota">🔒 Serás redirigido a Webpay para pagar de forma segura.</p>
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

    @if (mostrarModalError) {
      <div class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon">⚠️</div>
          <h3>No se pudo procesar el pago</h3>
          <p>{{ mensajeError }}</p>
          <div class="modal-actions modal-actions-single">
            <button class="btn-primary" (click)="cerrarModalError()">Entendido</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cart-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .subtitle {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Estructura de la tarjeta de producto en el carrito */
    .cart-item-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: #ffffff;
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    /* FIX: Dimensiones y escalado de la imagen */
    .item-img {
      width: 90px;
      height: 90px;
      object-fit: contain; /* Mantiene la proporción sin deformarse */
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 0.25rem;
      flex-shrink: 0; /* Impide que la imagen se reduzca o ensanche */
      border: 1px solid #f3f4f6;
    }

    .item-info {
      flex: 1;
    }

    .item-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }

    .item-price {
      margin: 0;
      font-size: 0.95rem;
      color: #4b5563;
      font-weight: 500;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
    }

    .quantity-controls button {
      border: none;
      background: transparent;
      width: 24px;
      height: 24px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      color: #374151;
    }

    .quantity-controls span {
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    .btn-remove {
      background: transparent;
      border: none;
      color: #ef4444;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.5rem;
    }

    .btn-remove:hover {
      text-decoration: underline;
    }

    .cart-summary-card {
      background: #ffffff;
      padding: 1.5rem;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .total-row {
      font-size: 1.15rem;
      margin-top: 1rem;
    }

    .text-success {
      color: #10b981;
    }

    .btn-checkout {
      width: 100%;
      margin-top: 1.25rem;
      padding: 0.75rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-checkout:hover {
      background: #1d4ed8;
    }

    .btn-checkout:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }

    .pago-nota {
      margin: 0.75rem 0 0;
      font-size: 0.8rem;
      color: #6b7280;
      text-align: center;
    }
  `]
})
export class Carrito {
  protected cartService = inject(CartService);
  private carritoService = inject(CarritoService);
  private ordenService = inject(OrdenService);
  private pagoService = inject(PagoService);
  private msalService = inject(MsalService);

  mostrarModalLogin = false;
  mostrarModalVacio = false;
  mostrarModalError = false;

  procesando = false;
  mensajeError = '';

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

    this.realizarCompra(account.username);
  }

  // Flujo de compra:
  // carrito (ms-carrito) -> orden PENDIENTE_PAGO (ms-orders) -> Webpay (ms-pago).
  // El carrito se vacia en /pago-resultado, solo si el pago es aprobado.
  realizarCompra(usuarioId: string): void {
    const items = this.cartService.items();
    this.procesando = true;

    // 1. Guarda los items en ms-carrito
    const guardarItems = items.map(item =>
      this.carritoService.agregar({
        usuarioId,
        productoId: item.producto.id,
        nombreProducto: item.producto.nombre,
        precioUnitario: item.producto.precio,
        cantidad: item.cantidad
      })
    );

    forkJoin(guardarItems).pipe(

      // 2. Registra la orden en ms-orders (queda PENDIENTE_PAGO)
      switchMap(() => this.ordenService.crear({
        usuarioId,
        email: usuarioId,
        items: items.map(item => ({
          productoId: item.producto.id,
          cantidad: item.cantidad
        }))
      })),

      // 3. Crea la transaccion en Webpay (ms-pago obtiene el monto desde ms-orders)
      switchMap(orden => this.pagoService.iniciarWebpay(orden.id))

    ).subscribe({
      next: (respuesta) => {
        if (respuesta.url && respuesta.token) {
          // 4. Sale de la tienda hacia Webpay (procesando queda en true)
          this.pagoService.redirigirAWebpay(respuesta.url, respuesta.token);
        } else {
          this.procesando = false;
          this.mensajeError = 'No se pudo iniciar el pago con Webpay. Inténtalo nuevamente.';
          this.mostrarModalError = true;
        }
      },
      error: (err) => {
        console.error('Error al procesar el pago:', err);
        this.procesando = false;

        // 403 de ms-pago: bloqueado por la regla antifraude
        if (err?.status === 403 && err?.error?.estado === 'BLOQUEADO_FRAUDE') {
          this.mensajeError = 'Por seguridad bloqueamos este intento: hubo demasiados intentos de pago '
            + 'en poco tiempo. Espera unos segundos y vuelve a intentarlo desde Mis Órdenes.';
        } else {
          this.mensajeError = err?.error?.mensaje
            ?? err?.error?.message
            ?? 'Ocurrió un problema al procesar tu compra. Inténtalo nuevamente.';
        }

        this.mostrarModalError = true;
      }
    });
  }

  iniciarSesionYContinuar(): void {
    this.mostrarModalLogin = false;
    for (const key of Object.keys(sessionStorage)) {
      if (key.includes('msal')) sessionStorage.removeItem(key);
    }
    this.msalService.loginRedirect({ scopes: ['user.read', 'openid', 'profile'] });
  }

  manejarErrorImagen(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/placeholder-deportivo.jpg';
  }

  cerrarModal(): void { this.mostrarModalLogin = false; }
  cerrarModalVacio(): void { this.mostrarModalVacio = false; }
  cerrarModalError(): void { this.mostrarModalError = false; }
}