import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../services/cart.spec';
import { ProductoService, Producto } from '../services/producto.service';

@Component({
  selector: 'app-productos',
  imports: [CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Catálogo de Artículos Deportivos</h1>
        <p>Equípate con lo mejor. Indumentaria y accesorios para llevar tu entrenamiento al siguiente nivel.</p>
      </div>

      <div class="product-grid">
        @for (prod of productos(); track prod.id) {
          <div class="product-card">
            <div class="product-info">
              <h3>{{ prod.nombre }}</h3>
              <p>{{ prod.descripcion }}</p>
              <p class="product-price">{{ prod.precio | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</p>
              <button class="btn-primary" (click)="agregar(prod)">
                Agregar al Carrito
              </button>
            </div>
          </div>
        } @empty {
          <p>No hay productos disponibles.</p>
        }
      </div>
    </div>
  `
})
export class Productos implements OnInit {
  private cartService = inject(CartService);
  private productoService = inject(ProductoService);

  productos = signal<Producto[]>([]);

  ngOnInit(): void {
    this.productoService.getAll().subscribe({
      next: (data) => this.productos.set(data),
      error: (err) => console.error('Error cargando productos:', err)
    });
  }

  agregar(producto: Producto): void {
    this.cartService.agregar(producto as any);
  }
}