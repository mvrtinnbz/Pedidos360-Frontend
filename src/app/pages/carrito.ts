import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-container">
      <h2>Tu Carrito de Compras</h2>
      <p class="subtitle">Revisa los artículos seleccionados antes de procesar la orden.</p>

      <div class="cart-layout">
        <div class="cart-items">
          @for (item of items; track item.id) {
            <div class="cart-item-card">
              <div class="item-img-placeholder"></div>
              <div class="item-info">
                <h3>{{ item.nombre }}</h3>
                <p class="item-price">\${{ item.precio }}</p>
              </div>

              <div class="quantity-controls">
                <button (click)="disminuirCantidad(item)">-</button>
                <span>{{ item.cantidad }}</span>
                <button (click)="aumentarCantidad(item)">+</button>
              </div>

              <button class="btn-remove" (click)="eliminarItem(item.id)">Quitar</button>
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
            <span>Subtotal ({{ items.length }} items)</span>
            <span>\${{ obtenerSubtotal() }}</span>
          </div>
          
          <div class="summary-row">
            <span>Envío estimado</span>
            <span class="text-success">Gratis</span>
          </div>

          <hr />

          <div class="summary-row total-row">
            <strong>Total</strong>
            <strong>\${{ obtenerSubtotal() }}</strong>
          </div>

          <button class="btn-checkout" (click)="procesarPedido()">
            Procesar Pedido
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 1: Requerir Inicio de Sesión -->
    @if (mostrarModalLogin) {
      <div class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon">🔒</div>
          <h3>Inicio de Sesión Requerido</h3>
          <p>
            Para continuar con el proceso de pago y completar tu compra, necesitas iniciar sesión con tu cuenta.
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="cerrarModal()">Cancelar</button>
            <button class="btn-primary" (click)="iniciarSesionYContinuar()">Iniciar Sesión</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal 2: Confirmación de Pago Exitoso -->
    @if (mostrarModalExito) {
      <div class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon text-success">✅</div>
          <p>Procediendo al pago del pedido.</p>
          <div class="modal-actions modal-actions-single">
            <button class="btn-primary" (click)="cerrarModalExito()">Aceptar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class Carrito implements OnInit {
  private msalService = inject(MsalService);
  private cdr = inject(ChangeDetectorRef);

  isLoggedIn = false;
  mostrarModalLogin = false;
  mostrarModalExito = false;

  items = [
    { id: 1, nombre: 'Producto Ejemplo 1', precio: 15000, cantidad: 1 },
    { id: 2, nombre: 'Producto Ejemplo 2', precio: 28000, cantidad: 1 }
  ];

  ngOnInit(): void {
    this.verificarEstadoSesion();
  }

  verificarEstadoSesion(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    const allAccounts = this.msalService.instance.getAllAccounts();
    this.isLoggedIn = !!activeAccount || allAccounts.length > 0;
    this.cdr.detectChanges();
  }

  procesarPedido(): void {
    this.verificarEstadoSesion();

    if (!this.isLoggedIn) {
      this.mostrarModalLogin = true;
      return;
    }

    this.ejecutarPago();
  }

  iniciarSesionYContinuar(): void {
    this.mostrarModalLogin = false;

    for (const key of Object.keys(sessionStorage)) {
      if (key.includes('msal')) {
        sessionStorage.removeItem(key);
      }
    }

    this.msalService.loginRedirect({
      scopes: ['user.read', 'openid', 'profile']
    });
  }

  cerrarModal(): void {
    this.mostrarModalLogin = false;
  }

  ejecutarPago(): void {
    this.mostrarModalExito = true;
  }

  cerrarModalExito(): void {
    this.mostrarModalExito = false;
  }

  obtenerSubtotal(): number {
    return this.items.reduce((total, i) => total + (i.precio * i.cantidad), 0);
  }

  aumentarCantidad(item: any): void {
    item.cantidad++;
  }

  disminuirCantidad(item: any): void {
    if (item.cantidad > 1) {
      item.cantidad--;
    }
  }

  eliminarItem(id: number): void {
    this.items = this.items.filter(i => i.id !== id);
  }
}