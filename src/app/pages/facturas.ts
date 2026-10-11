
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { Factura, FacturaService } from '../services/factura.service';

type CriterioFecha = 'fecha-desc' | 'fecha-asc';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">

      <div class="page-header">
        <h1>Mis Facturas</h1>
        <p>Consulta las facturas de tus compras en FullSport360.</p>
      </div>

      @if (cargando()) {
        <p>Cargando tus facturas...</p>

      } @else if (error()) {
        <div class="cart-summary-card">
          <h2>No se pudieron cargar tus facturas</h2>
          <p>Verifica tu sesión o inténtalo nuevamente.</p>

          <button
            type="button"
            class="btn-primary"
            (click)="cargarFacturas()">
            Reintentar
          </button>
        </div>

      } @else if (facturas().length === 0) {
        <div class="cart-summary-card">
          <h2>Aún no tienes facturas</h2>
          <p>
            Cuando se facture una orden, podrás consultar
            su comprobante aquí.
          </p>
        </div>

      } @else {

        <!-- LISTADO COMPACTO DE FACTURAS -->
        <div class="ordenes-panel">

          <!-- ORDENAMIENTO POR FECHA -->
          <div class="ordenes-toolbar">

            <span>
              {{ facturas().length }}
              {{ facturas().length === 1
                ? 'factura registrada'
                : 'facturas registradas' }}
            </span>

            <div class="ordenes-filtro">
              <label for="ordenar-facturas">
                Ordenar por
              </label>

              <select
                id="ordenar-facturas"
                #selectorFecha
                [value]="criterio()"
                (change)="cambiarOrden(selectorFecha.value)">

                <option value="fecha-desc">
                  Fecha: más recientes
                </option>

                <option value="fecha-asc">
                  Fecha: más antiguas
                </option>

              </select>
            </div>
          </div>

          <!-- TABLA -->
          <div class="ordenes-tabla-scroll">

            <table class="ordenes-tabla">

              <thead>
                <tr>
                  <th scope="col">Factura</th>
                  <th scope="col">Orden relacionada</th>
                  <th scope="col">Fecha de emisión</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>

              <tbody>
                @for (factura of facturasPagina(); track factura.id) {
                  <tr>

                    <td>
                      <strong>
                        {{ factura.numeroFactura || '#' + factura.id }}
                      </strong>
                    </td>

                    <td>
                      #{{ factura.ordenId }}
                    </td>

                    <td>
                      {{ factura.fechaEmision |
                         date:'dd/MM/yyyy HH:mm' }}
                    </td>

                    <td>
                      <button
                        type="button"
                        class="btn-primary orden-btn-detalle"
                        (click)="verDetalle(factura.id)">
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

    <!-- MODAL DE DETALLE DE FACTURA -->
    @if (modalAbierto()) {
      <div
        class="modal-overlay"
        (click)="cerrarDetalle()">

        <div
          class="modal-factura"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-detalle-factura"
          (click)="$event.stopPropagation()">

          <div class="modal-header">

            <div>
              <h2 id="titulo-detalle-factura">
                Detalle de Factura
              </h2>
              <p>FullSport360</p>
            </div>

            <button
              type="button"
              class="btn-cerrar"
              aria-label="Cerrar detalle de factura"
              (click)="cerrarDetalle()">
              ×
            </button>

          </div>

          <div class="modal-body">

            @if (cargandoDetalle()) {
              <p>Cargando detalle de factura...</p>

            } @else if (errorDetalle()) {
              <p>
                No se pudo cargar el detalle de esta factura.
                Inténtalo nuevamente.
              </p>

            } @else if (facturaSeleccionada(); as f) {

              <div class="factura-numero">

                <h3>
                  {{ f.numeroFactura || 'Factura #' + f.id }}
                </h3>

                <span class="factura-estado">
                  {{ f.estado }}
                </span>

              </div>

              <!-- INFORMACIÓN GENERAL -->
              <div class="factura-info">

                <div class="summary-row">
                  <span>Número de factura</span>
                  <strong>
                    {{ f.numeroFactura || '#' + f.id }}
                  </strong>
                </div>

                <div class="summary-row">
                  <span>Orden relacionada</span>
                  <strong>#{{ f.ordenId }}</strong>
                </div>

                <div class="summary-row">
                  <span>Fecha de emisión</span>
                  <span>
                    {{ f.fechaEmision |
                       date:'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>

                <div class="summary-row">
                  <span>Estado</span>
                  <strong>{{ f.estado }}</strong>
                </div>

                <div class="summary-row">
                  <span>Correo del cliente</span>
                  <span>{{ f.email || 'No disponible' }}</span>
                </div>

              </div>

              <!-- PRODUCTOS FACTURADOS -->
              <h3 class="detalle-subtitulo">
                Productos facturados
              </h3>

              <div class="detalle-tabla">

                <div class="detalle-encabezado">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Subtotal</span>
                </div>

                @for (d of f.detalles || []; track d.id) {
                  <div class="detalle-fila">

                    <span>
                      {{ d.nombreProducto }}
                    </span>

                    <span>
                      {{ d.cantidad }}
                    </span>

                    <span>
                      {{ d.subtotal |
                         currency:'CLP':'symbol-narrow':'1.0-0' }}
                    </span>

                  </div>
                } @empty {
                  <p>No hay productos para mostrar.</p>
                }

              </div>

              <!-- TOTAL FACTURADO -->
              <div class="factura-total">

                <span>Total facturado</span>

                <strong>
                  {{ f.total |
                     currency:'CLP':'symbol-narrow':'1.0-0' }}
                </strong>

              </div>

              <p class="factura-pie">
                Comprobante de compra — FullSport360
              </p>

            }
          </div>

          <div class="modal-footer">

            <button
              type="button"
              class="btn-volver"
              (click)="cerrarDetalle()">
              Cerrar
            </button>

          </div>

        </div>
      </div>
    }
  `
})
export class Facturas implements OnInit {

  private facturaService = inject(FacturaService);

  // LISTADO
  facturas = signal<Factura[]>([]);
  cargando = signal(true);
  error = signal(false);

  // ORDENAMIENTO POR FECHA
  criterio = signal<CriterioFecha>('fecha-desc');

  // PAGINACIÓN
  pagina = signal(1);
  readonly tamanoPagina = 5;

  // FACTURAS ORDENADAS SIN MODIFICAR EL ARREGLO ORIGINAL
  facturasOrdenadas = computed(() => {
    const lista = [...this.facturas()];

    if (this.criterio() === 'fecha-asc') {
      return lista.sort((a, b) =>
        new Date(a.fechaEmision).getTime() -
        new Date(b.fechaEmision).getTime()
      );
    }

    return lista.sort((a, b) =>
      new Date(b.fechaEmision).getTime() -
      new Date(a.fechaEmision).getTime()
    );
  });

  // TOTAL DE PÁGINAS
  totalPaginas = computed(() =>
    Math.max(
      1,
      Math.ceil(
        this.facturasOrdenadas().length / this.tamanoPagina
      )
    )
  );

  // FACTURAS DE LA PÁGINA ACTUAL
  facturasPagina = computed(() => {
    const inicio =
      (this.pagina() - 1) * this.tamanoPagina;

    return this.facturasOrdenadas().slice(
      inicio,
      inicio + this.tamanoPagina
    );
  });

  // MODAL
  facturaSeleccionada = signal<Factura | null>(null);
  modalAbierto = signal(false);
  cargandoDetalle = signal(false);
  errorDetalle = signal(false);

  private solicitudDetalle = 0;

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.facturaService.obtenerMisFacturas().subscribe({
      next: (data) => {
        this.facturas.set(data);
        this.pagina.set(1);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al consultar facturas:', err);
        this.error.set(true);
        this.cargando.set(false);
      }
    });
  }

  // CAMBIAR ORDENAMIENTO
  cambiarOrden(valor: string): void {
    if (
      valor === 'fecha-desc' ||
      valor === 'fecha-asc'
    ) {
      this.criterio.set(valor);
      this.pagina.set(1);
    }
  }

  // CAMBIAR PÁGINA
  cambiarPagina(nuevaPagina: number): void {
    if (
      nuevaPagina < 1 ||
      nuevaPagina > this.totalPaginas()
    ) {
      return;
    }

    this.pagina.set(nuevaPagina);
  }

  // OBTENER DETALLE DESDE MS-FACTURACION
  verDetalle(id: number): void {
    const solicitudActual = ++this.solicitudDetalle;

    this.facturaSeleccionada.set(null);
    this.errorDetalle.set(false);
    this.cargandoDetalle.set(true);
    this.modalAbierto.set(true);

    this.facturaService.obtenerPorId(id).subscribe({
      next: (factura) => {
        if (
          !this.modalAbierto() ||
          solicitudActual !== this.solicitudDetalle
        ) {
          return;
        }

        this.facturaSeleccionada.set(factura);
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
          'Error al cargar detalle de factura:',
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
    this.facturaSeleccionada.set(null);
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
