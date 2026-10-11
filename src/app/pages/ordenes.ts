
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { Orden, OrdenService } from '../services/orden.service';

type CriterioOrden =
  | 'fecha-desc'
  | 'fecha-asc'
  | 'total-desc'
  | 'total-asc';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">

      <div class="page-header">
        <h1>Mis Órdenes</h1>
        <p>Consulta el historial de tus compras en FullSport360.</p>
      </div>

      @if (cargando()) {
        <p>Cargando tus órdenes...</p>

      } @else if (error()) {
        <div class="cart-summary-card">
          <h2>No se pudieron cargar tus órdenes</h2>
          <p>Verifica tu sesión o inténtalo nuevamente.</p>

          <button
            type="button"
            class="btn-primary"
            (click)="cargarOrdenes()">
            Reintentar
          </button>
        </div>

      } @else if (ordenes().length === 0) {
        <div class="cart-summary-card">
          <h2>Aún no tienes órdenes</h2>
          <p>Cuando realices una compra, aparecerá aquí.</p>
        </div>

      } @else {

        <div class="ordenes-panel">

          <!-- ORDENAMIENTO POR FECHA -->
          <div class="ordenes-toolbar">
            <span>
              {{ ordenes().length }}
              {{ ordenes().length === 1
                ? 'orden registrada'
                : 'órdenes registradas' }}
            </span>

            <div class="ordenes-filtro">
              <label for="ordenar-ordenes">
                Ordenar por
              </label>

              <select
                id="ordenar-ordenes"
                #selectorOrden
                [value]="criterio().startsWith('fecha') ? criterio() : ''"
                (change)="cambiarOrden(selectorOrden.value)">

                <option value="fecha-desc">
                  Fecha: más recientes
                </option>

                <option value="fecha-asc">
                  Fecha: más antiguas
                </option>

              </select>
            </div>
          </div>

          <!-- TABLA DE ÓRDENES -->
          <div class="ordenes-tabla-scroll">
            <table class="ordenes-tabla">

              <thead>
                <tr>
                  <th scope="col">Número</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>

                  <!-- TOTAL CON FLECHAS FUNCIONALES -->
                  <th scope="col">
                    <div class="ordenes-total-header">

                      <span>Total</span>

                      <button
                        type="button"
                        class="ordenes-flecha"
                        [class.activa]="criterio() === 'total-asc'"
                        [attr.aria-pressed]="criterio() === 'total-asc'"
                        (click)="cambiarOrden('total-asc')"
                        aria-label="Ordenar total de menor a mayor"
                        title="Menor a mayor">
                        ↑
                      </button>

                      <button
                        type="button"
                        class="ordenes-flecha"
                        [class.activa]="criterio() === 'total-desc'"
                        [attr.aria-pressed]="criterio() === 'total-desc'"
                        (click)="cambiarOrden('total-desc')"
                        aria-label="Ordenar total de mayor a menor"
                        title="Mayor a menor">
                        ↓
                      </button>

                    </div>
                  </th>

                  <th scope="col">Acción</th>
                </tr>
              </thead>

              <tbody>
                @for (orden of ordenesPagina(); track orden.id) {
                  <tr>

                    <td>
                      <strong>#{{ orden.id }}</strong>
                    </td>

                    <td>
                      {{ orden.fechaCreacion |
                         date:'dd/MM/yyyy HH:mm' }}
                    </td>

                    <td>
                      <span class="orden-estado">
                        {{ orden.estado }}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {{ orden.total |
                           currency:'CLP':'symbol-narrow':'1.0-0' }}
                      </strong>
                    </td>

                    <td>
                      <button
                        type="button"
                        class="btn-primary orden-btn-detalle"
                        (click)="verDetalle(orden.id)">
                        Ver detalle
                      </button>
                    </td>

                  </tr>
                }
              </tbody>

            </table>
          </div>

          <!-- PAGINACIÓN -->
          @if (totalPaginas() > 1) {
            <div class="ordenes-paginacion">

              <button
                type="button"
                class="btn-secondary"
                [disabled]="pagina() === 1"
                (click)="cambiarPagina(pagina() - 1)">
                Anterior
              </button>

              <span>
                Página {{ pagina() }} de {{ totalPaginas() }}
              </span>

              <button
                type="button"
                class="btn-secondary"
                [disabled]="pagina() === totalPaginas()"
                (click)="cambiarPagina(pagina() + 1)">
                Siguiente
              </button>

            </div>
          }

        </div>
      }
    </div>

    <!-- MODAL DE DETALLE DE ORDEN -->
    @if (modalAbierto()) {
      <div
        class="modal-overlay"
        (click)="cerrarDetalle()">

        <div
          class="modal-factura"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-detalle-orden"
          (click)="$event.stopPropagation()">

          <div class="modal-header">

            <div>
              <h2 id="titulo-detalle-orden">
                Detalle de Orden
              </h2>
              <p>FullSport360</p>
            </div>

            <button
              type="button"
              class="btn-cerrar"
              aria-label="Cerrar detalle de orden"
              (click)="cerrarDetalle()">
              ×
            </button>

          </div>

          <div class="modal-body">

            @if (cargandoDetalle()) {
              <p>Cargando detalle de la orden...</p>

            } @else if (errorDetalle()) {
              <p>
                No se pudo cargar el detalle de esta orden.
                Inténtalo nuevamente.
              </p>

            } @else if (ordenSeleccionada(); as o) {

              <div class="factura-numero">

                <h3>Orden #{{ o.id }}</h3>

                <span class="orden-estado">
                  {{ o.estado }}
                </span>

              </div>

              <!-- INFORMACIÓN GENERAL -->
              <div class="factura-info">

                <div class="summary-row">
                  <span>Número de orden</span>
                  <strong>#{{ o.id }}</strong>
                </div>

                <div class="summary-row">
                  <span>Fecha de creación</span>
                  <span>
                    {{ o.fechaCreacion |
                       date:'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>

                <div class="summary-row">
                  <span>Estado</span>
                  <strong>{{ o.estado }}</strong>
                </div>

                <div class="summary-row">
                  <span>Correo del cliente</span>
                  <span>{{ o.email || 'No disponible' }}</span>
                </div>

              </div>

              <!-- PRODUCTOS DE LA ORDEN -->
              <h3 class="detalle-subtitulo">
                Productos comprados
              </h3>

              <div class="detalle-tabla">

                <div class="detalle-encabezado">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Subtotal</span>
                </div>

                @for (item of o.items || []; track item.id) {
                  <div class="detalle-fila">

                    <span>{{ item.nombreProducto }}</span>

                    <span>{{ item.cantidad }}</span>

                    <span>
                      {{
                        item.precioUnitario * item.cantidad |
                        currency:'CLP':'symbol-narrow':'1.0-0'
                      }}
                    </span>

                  </div>
                } @empty {
                  <p class="ordenes-sin-detalles">
                    No hay productos disponibles.
                  </p>
                }

              </div>

              <!-- TOTAL -->
              <div class="factura-total">

                <span>Total de la orden</span>

                <strong>
                  {{ o.total |
                     currency:'CLP':'symbol-narrow':'1.0-0' }}
                </strong>

              </div>

              <p class="factura-pie">
                Resumen de compra — FullSport360
              </p>

            }
          </div>

          <div class="modal-footer">

            <button
              type="button"
              class="btn-primary"
              (click)="cerrarDetalle()">
              Cerrar
            </button>

          </div>

        </div>
      </div>
    }
  `
})
export class Ordenes implements OnInit {

  private ordenService = inject(OrdenService);

  // LISTADO DE ÓRDENES
  ordenes = signal<Orden[]>([]);
  cargando = signal(true);
  error = signal(false);

  // ORDENAMIENTO
  criterio = signal<CriterioOrden>('fecha-desc');

  // PAGINACIÓN
  pagina = signal(1);
  readonly tamanoPagina = 5;

  // ÓRDENES ORDENADAS
  ordenesOrdenadas = computed(() => {
    const lista = [...this.ordenes()];

    switch (this.criterio()) {

      case 'fecha-asc':
        return lista.sort((a, b) =>
          new Date(a.fechaCreacion).getTime() -
          new Date(b.fechaCreacion).getTime()
        );

      case 'total-desc':
        return lista.sort((a, b) =>
          b.total - a.total
        );

      case 'total-asc':
        return lista.sort((a, b) =>
          a.total - b.total
        );

      case 'fecha-desc':
      default:
        return lista.sort((a, b) =>
          new Date(b.fechaCreacion).getTime() -
          new Date(a.fechaCreacion).getTime()
        );
    }
  });

  // CANTIDAD TOTAL DE PÁGINAS
  totalPaginas = computed(() =>
    Math.max(
      1,
      Math.ceil(
        this.ordenesOrdenadas().length / this.tamanoPagina
      )
    )
  );

  // ÓRDENES DE LA PÁGINA ACTUAL
  ordenesPagina = computed(() => {
    const inicio =
      (this.pagina() - 1) * this.tamanoPagina;

    return this.ordenesOrdenadas().slice(
      inicio,
      inicio + this.tamanoPagina
    );
  });

  // MODAL
  ordenSeleccionada = signal<Orden | null>(null);
  modalAbierto = signal(false);
  cargandoDetalle = signal(false);
  errorDetalle = signal(false);

  private solicitudDetalle = 0;

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.ordenService.obtenerMisOrdenes().subscribe({
      next: (data) => {
        this.ordenes.set(data);
        this.pagina.set(1);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al consultar órdenes:', err);
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  // CAMBIAR ORDENAMIENTO DESDE SELECTOR O FLECHAS
  cambiarOrden(valor: string): void {
    if (
      valor === 'fecha-desc' ||
      valor === 'fecha-asc' ||
      valor === 'total-desc' ||
      valor === 'total-asc'
    ) {
      this.criterio.set(valor);
      this.pagina.set(1);
    }
  }

  cambiarPagina(nuevaPagina: number): void {
    if (
      nuevaPagina < 1 ||
      nuevaPagina > this.totalPaginas()
    ) {
      return;
    }

    this.pagina.set(nuevaPagina);
  }

  // CONSULTAR DETALLE DESDE EL BACKEND
  verDetalle(id: number): void {
    const solicitudActual = ++this.solicitudDetalle;

    this.ordenSeleccionada.set(null);
    this.errorDetalle.set(false);
    this.cargandoDetalle.set(true);
    this.modalAbierto.set(true);

    this.ordenService.obtenerPorId(id).subscribe({
      next: (orden) => {
        if (
          !this.modalAbierto() ||
          solicitudActual !== this.solicitudDetalle
        ) {
          return;
        }

        this.ordenSeleccionada.set(orden);
        this.cargandoDetalle.set(false);
      },
      error: (err) => {
        if (
          !this.modalAbierto() ||
          solicitudActual !== this.solicitudDetalle
        ) {
          return;
        }

        console.error(
          'Error al cargar detalle de orden:',
          err
        );

        this.errorDetalle.set(true);
        this.cargandoDetalle.set(false);
      }
    });
  }

  cerrarDetalle(): void {
    ++this.solicitudDetalle;

    this.modalAbierto.set(false);
    this.ordenSeleccionada.set(null);
    this.cargandoDetalle.set(false);
    this.errorDetalle.set(false);
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    if (this.modalAbierto()) {
      this.cerrarDetalle();
    }
  }
}
