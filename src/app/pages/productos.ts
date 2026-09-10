import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
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
          <div class="product-card" (click)="verDetalle(prod.id)">
            
            <div class="product-image">
              <img 
                [src]="'/' + prod.id + '.jpg'" 
                [alt]="prod.id" 
                loading="lazy" 
                (error)="manejarErrorImagen($event)"
              >
            </div>

            <div class="product-info">
              <h3>{{ prod.nombre }}</h3>
              <p class="product-desc">{{ prod.descripcion }}</p>
              <p class="product-price">{{ prod.precio | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</p>
              <button class="btn-primary" (click)="agregar(prod); $event.stopPropagation()">
                Agregar al Carrito
              </button>
            </div>
          </div>
        } @empty {
          <p>No hay productos disponibles.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
      align-items: stretch;
    }

    .product-card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    /* Contenedor y formateo uniforme para la imagen */
    .product-image {
      width: 100%;
      height: 220px;
      background-color: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
    }

    .product-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain; /* Asegura que la imagen quepa completa sin recortarse */
      display: block;
    }

    .product-info {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1; /* Ocupa el espacio disponible para nivelar tarjetas */
    }

    .product-info h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .product-desc {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.4;
    }

    .product-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 1rem 0;
    }

    .btn-primary {
      margin-top: auto; /* Alinea los botones siempre al fondo */
      width: 100%;
      padding: 0.75rem 1rem;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn-primary:hover {
      background-color: #1d4ed8;
    }
  `]
})
export class Productos implements OnInit {
  private cartService = inject(CartService);
  private productoService = inject(ProductoService);
  private router = inject(Router);

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

  verDetalle(id: number): void {
    this.router.navigate(['/productos', id]);
  }

  manejarErrorImagen(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/placeholder-deportivo.jpg'; 
  }
}