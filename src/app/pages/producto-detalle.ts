import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.spec';
import { ProductoService, Producto } from '../services/producto.service';
import { InteraccionService } from '../services/interaccion.service';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <div class="page-container">
      <a routerLink="/productos" class="back-link">&larr; Volver al catálogo</a>

      @if (producto(); as prod) {
        <div class="detail-card">
          <div class="product-image">
            <img
              [src]="'/' + prod.id + '.jpg'"
              [alt]="prod.id"
              (error)="manejarErrorImagen($event)"
            >
          </div>

          <div class="product-info">
            <h1>{{ prod.nombre }}</h1>
            <p class="product-desc">{{ prod.descripcion }}</p>
            <p class="product-price">{{ prod.precio | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</p>
            <p class="product-stock">Stock disponible: {{ prod.stock }}</p>
            <button class="btn-primary" (click)="agregar(prod)">
              Agregar al Carrito
            </button>
          </div>
        </div>
      } @else if (noEncontrado()) {
        <p class="not-found">No se encontró el producto solicitado.</p>
      } @else {
        <p>Cargando producto...</p>
      }
        @if (recomendados().length > 0) {
          <section class="recomendados">
            <h2>Te puede interesar</h2>
            <div class="rec-grid">
              @for (r of recomendados(); track r.id) {
                <a class="rec-card" [routerLink]="['/productos', r.id]">
                  <img [src]="'/' + r.id + '.jpg'" [alt]="r.nombre" (error)="manejarErrorImagen($event)">
                  <span class="rec-nombre">{{ r.nombre }}</span>
                  <span class="rec-precio">{{ r.precio | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</span>
                </a>
              }
            </div>
          </section>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .detail-card {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 2rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 640px) {
      .detail-card {
        grid-template-columns: 1fr;
      }
    }

    .product-image {
      width: 100%;
      height: 280px;
      background-color: #f9fafb;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      box-sizing: border-box;
      border-radius: 8px;
    }

    .product-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    .product-info h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.75rem 0;
      color: #1f2937;
    }

    .product-desc {
      font-size: 0.95rem;
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .product-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 0.5rem 0;
    }

    .product-stock {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1.5rem 0;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
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

    .not-found {
      color: #6b7280;
      text-align: center;
      margin-top: 2rem;
    }
    .recomendados { margin-top: 2rem; }
    .recomendados h2 { font-size: 1.2rem; color: #1f2937; margin: 0 0 1rem; }
    .rec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
    .rec-card { display: flex; flex-direction: column; gap: 0.4rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.75rem; text-decoration: none; color: inherit; }
    .rec-card:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
    .rec-card img { width: 100%; height: 110px; object-fit: contain; background: #f9fafb; border-radius: 6px; }
    .rec-nombre { font-size: 0.9rem; font-weight: 600; color: #1f2937; }
    .rec-precio { font-size: 0.9rem; color: #2563eb; font-weight: 700; }
  `]
})
export class ProductoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private cartService = inject(CartService);
  private interaccionService = inject(InteraccionService);
  private analyticsService = inject(AnalyticsService);

  producto = signal<Producto | null>(null);
  noEncontrado = signal(false);
  recomendados = signal<Producto[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const id = Number(idParam);

      this.producto.set(null);
      this.noEncontrado.set(false);
      this.recomendados.set([]);

      if (!idParam || Number.isNaN(id)) {
        this.noEncontrado.set(true);
        return;
      }

      this.productoService.getById(id).subscribe({
        next: (data) => {
          this.producto.set(data);
          // Kafka: PRODUCTO_VISTO (ms-productos)
          this.interaccionService.registrarVista(data.id);
        },
        error: (err) => {
          console.error('Error cargando producto:', err);
          this.noEncontrado.set(true);
        }
      });

      // Recomendaciones (ms-analytics); si falla, el bloque simplemente no aparece
      this.analyticsService.getRecomendaciones().subscribe({
        next: (lista) => this.recomendados.set(lista.filter((p) => p.id !== id).slice(0, 4)),
        error: () => {}
      });
    });
  }

  agregar(producto: Producto): void {
    this.cartService.agregar(producto as any);
    // Kafka: PRODUCTO_AGREGADO_CARRITO (ms-carrito)
    this.interaccionService.registrarAgregadoCarrito(producto);
  }

  manejarErrorImagen(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/placeholder-deportivo.jpg';
  }
}