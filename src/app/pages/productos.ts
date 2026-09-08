import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService, Producto } from '../services/cart.spec';

@Component({
  selector: 'app-productos',
  imports: [CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Catálogo de Indumentaria Deportiva</h1>
        <p>Equípate con la mejor indumentaria para tu entrenamiento.</p>
      </div>

      <div class="product-grid">
        @for (prod of productosMock; track prod.id) {
          <div class="product-card">
            <div class="product-icon-wrapper">
              <span class="product-icon">{{ prod.imagen }}</span>
            </div>
            <div class="product-info">
              <span class="category-badge">{{ prod.categoria }}</span>
              <h3>{{ prod.nombre }}</h3>
              <p class="product-price">{{ prod.precio | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</p>
              <button class="btn-primary" (click)="agregar(prod)">
                Agregar al Carrito
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class Productos {
  private cartService = inject(CartService);

  productosMock: Producto[] = [
    { id: 1, nombre: 'Camiseta Running Pro', categoria: 'Running', precio: 19990, imagen: '🏃‍♂️' },
    { id: 2, nombre: 'Zapatillas Cushion Max', categoria: 'Calzado', precio: 69990, imagen: '👟' },
    { id: 3, nombre: 'Shorts de Entrenamiento Fit', categoria: 'Training', precio: 14990, imagen: '🩳' },
    { id: 4, nombre: 'Polerón Térmico Fleece', categoria: 'Outdoor', precio: 32990, imagen: '🧥' },
    { id: 5, nombre: 'Balón de Fútbol Pro Match', categoria: 'Fútbol', precio: 24990, imagen: '⚽' },
    { id: 6, nombre: 'Calzas de Compresión', categoria: 'Fitness', precio: 22990, imagen: '🧘‍♀️' }
  ];

  agregar(producto: Producto): void {
    this.cartService.agregar(producto);
  }
}