import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { CartService } from '../services/cart.spec';
import { CarritoService } from '../services/carrito.service';
import { Pago, PagoService } from '../services/pago.service';

@Component({
  selector: 'app-pago-resultado',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <div class="resultado-container">

      @if (cargando()) {
        <div class="resultado-card">
          <div class="resultado-icono">⏳</div>
          <h2>Verificando tu pago...</h2>
        </div>

      } @else if (pago(); as p) {

        @switch (p.estado) {

          @case ('APROBADO') {
            <div class="resultado-card aprobado">
              <div class="resultado-icono">✅</div>
              <h2>¡Pago aprobado!</h2>
              <p>Tu orden <strong>N° {{ p.ordenId }}</strong> fue pagada correctamente.
                 Te enviaremos la confirmación y la boleta a tu correo.</p>

              <div class="resultado-detalle">
                <div class="resultado-fila">
                  <span>Monto pagado</span>
                  <strong>{{ p.monto | currency:'CLP':'symbol-narrow':'1.0-0':'es-CL' }}</strong>
                </div>
                @if (p.tarjetaUltimos4) {
                  <div class="resultado-fila">
                    <span>Tarjeta</span>
                    <strong>**** {{ p.tarjetaUltimos4 }}</strong>
                  </div>
                }
                <div class="resultado-fila">
                  <span>Medio de pago</span>
                  <strong>Webpay Plus</strong>
                </div>
                <p class="resultado-nota">{{ p.detalle }}</p>
              </div>

              <div class="resultado-acciones">
                <a routerLink="/ordenes" class="btn-primary">Ver mis órdenes</a>
                <a routerLink="/productos" class="btn-secondary">Seguir comprando</a>
              </div>
            </div>
          }

          @case ('BLOQUEADO_FRAUDE') {
            <div class="resultado-card rechazado">
              <div class="resultado-icono">🔒</div>
              <h2>Pago bloqueado por seguridad</h2>
              <p>Detectamos demasiados intentos de pago en poco tiempo.
                 Espera unos segundos e inténtalo nuevamente.</p>
              <p class="resultado-nota">{{ p.detalle }}</p>

              <div class="resultado-acciones">
                <button type="button" class="btn-primary" (click)="reintentarPago()" [disabled]="reintentando()">
                  {{ reintentando() ? 'Redirigiendo...' : 'Reintentar pago' }}
                </button>
                <a routerLink="/carrito" class="btn-secondary">Volver al carrito</a>
              </div>
            </div>
          }

          @case ('PENDIENTE') {
            <div class="resultado-card">
              <div class="resultado-icono">⏳</div>
              <h2>Pago en proceso</h2>
              <p>Tu orden <strong>N° {{ p.ordenId }}</strong> aún no tiene un pago confirmado.</p>
              <div class="resultado-acciones">
                <a routerLink="/ordenes" class="btn-primary">Ver mis órdenes</a>
              </div>
            </div>
          }

          @default {
            <div class="resultado-card rechazado">
              <div class="resultado-icono">❌</div>
              <h2>Pago rechazado</h2>
              <p>No se pudo completar el pago de tu orden <strong>N° {{ p.ordenId }}</strong>.
                 Tu carrito se mantiene, puedes intentarlo nuevamente.</p>
              <p class="resultado-nota">{{ p.detalle }}</p>

              <div class="resultado-acciones">
                <button type="button" class="btn-primary" (click)="reintentarPago()" [disabled]="reintentando()">
                  {{ reintentando() ? 'Redirigiendo...' : 'Reintentar pago' }}
                </button>
                <a routerLink="/carrito" class="btn-secondary">Volver al carrito</a>
              </div>
            </div>
          }
        }

      } @else {
        <div class="resultado-card rechazado">
          <div class="resultado-icono">⚠️</div>
          <h2>No pudimos identificar el pago</h2>
          <p>Revisa el estado de tu compra en Mis Órdenes.</p>
          <div class="resultado-acciones">
            <a routerLink="/ordenes" class="btn-primary">Ver mis órdenes</a>
          </div>
        </div>
      }

      @if (mensajeError()) {
        <p class="resultado-error">{{ mensajeError() }}</p>
      }
    </div>
  `,
  styles: [`
    .resultado-container {
      max-width: 560px;
      margin: 0 auto;
      padding: 3rem 1rem;
    }

    .resultado-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-top: 5px solid #2563eb;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .resultado-card.aprobado { border-top-color: #16a34a; }
    .resultado-card.rechazado { border-top-color: #ef4444; }

    .resultado-icono {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .resultado-card h2 {
      margin: 0 0 0.75rem;
      color: #0f172a;
    }

    .resultado-card p {
      color: #475569;
      line-height: 1.5;
    }

    .resultado-detalle {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin: 1.25rem 0;
      text-align: left;
    }

    .resultado-fila {
      display: flex;
      justify-content: space-between;
      padding: 0.35rem 0;
    }

    .resultado-nota {
      font-size: 0.85rem;
      color: #64748b !important;
      margin: 0.5rem 0 0;
    }

    .resultado-acciones {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 1.5rem;
    }

    .resultado-acciones a,
    .resultado-acciones button {
      text-decoration: none;
    }

    .resultado-error {
      margin-top: 1rem;
      text-align: center;
      color: #ef4444;
      font-weight: 600;
    }
  `]
})
export class PagoResultado implements OnInit {
  private route = inject(ActivatedRoute);
  private pagoService = inject(PagoService);
  private cartService = inject(CartService);
  private carritoService = inject(CarritoService);
  private msalService = inject(MsalService);

  cargando = signal(true);
  pago = signal<Pago | null>(null);
  reintentando = signal(false);
  mensajeError = signal('');

  private ordenId: number | null = null;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const ordenId = Number(params.get('ordenId'));
    const pagoId = Number(params.get('pagoId'));

    // estado=ERROR (Webpay no pudo identificar el pago)
    if (!ordenId) {
      this.cargando.set(false);
      return;
    }

    this.ordenId = ordenId;

    // El estado se consulta a ms-pago: no se confia en lo que dice la URL
    this.pagoService.obtenerPorOrden(ordenId).subscribe({
      next: (pagos) => {
        const pago = pagos.find(p => p.id === pagoId) ?? pagos[0] ?? null;
        this.pago.set(pago);
        this.cargando.set(false);

        if (pago?.estado === 'APROBADO') {
          this.vaciarCarrito();
        }
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo consultar el estado del pago.');
      }
    });
  }

  // La compra se concreto: se vacia el carrito local y el de ms-carrito.
  private vaciarCarrito(): void {
    this.cartService.limpiar();

    const account = this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];

    if (account) {
      this.carritoService.vaciar(account.username).subscribe({ error: () => {} });
    }
  }

  // Nuevo intento de pago de la misma orden.
  reintentarPago(): void {
    if (!this.ordenId) {
      return;
    }

    this.reintentando.set(true);
    this.mensajeError.set('');

    this.pagoService.iniciarWebpay(this.ordenId).subscribe({
      next: (respuesta) => {
        if (respuesta.url && respuesta.token) {
          this.pagoService.redirigirAWebpay(respuesta.url, respuesta.token);
        }
      },
      error: (err) => {
        this.reintentando.set(false);
        this.mensajeError.set(
          err?.error?.detalle ?? err?.error?.message ?? 'No se pudo iniciar el pago. Inténtalo nuevamente.'
        );
      }
    });
  }
}