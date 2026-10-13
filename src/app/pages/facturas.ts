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
        <p>Consulta las boletas electrónicas de tus compras en FullSport360.</p>
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

    <!-- MODAL: BOLETA ELECTRÓNICA -->
    @if (modalAbierto()) {
      <div
        class="modal-overlay"
        (click)="cerrarDetalle()">

        <div
          class="modal-factura boleta-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-detalle-factura"
          (click)="$event.stopPropagation()">

          <div class="modal-header">

            <div>
              <h2 id="titulo-detalle-factura">
                Boleta Electrónica
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

              <div class="boleta">

                <!-- ENCABEZADO: EMISOR + RECUADRO DEL DOCUMENTO -->
                <div class="boleta-encabezado">

                  <div class="boleta-emisor">
                    <strong>FULLSPORT360 SpA</strong>
                    <span>Giro: Venta al por menor de artículos deportivos</span>
                    <span>Dirección: Av. Deportiva 360, Santiago</span>
                    <span>Comuna: Santiago</span>
                  </div>

                  <div class="boleta-recuadro">
                    <span>R.U.T.: 77.777.777-7</span>
                    <strong>{{ f.tipoDocumento || 'BOLETA ELECTRÓNICA' }}</strong>
                    <span>N° {{ f.numeroFactura || f.id }}</span>
                  </div>

                </div>

                <!-- RECEPTOR -->
                <div class="boleta-receptor">

                  <div>
                    <span class="boleta-etiqueta">Fecha</span>
                    <span>: {{ f.fechaEmision | date:'dd-MM-yyyy HH:mm' }}</span>
                  </div>

                  <div>
                    <span class="boleta-etiqueta">Señor(es)</span>
                    <span>: {{ f.nombreCliente || f.email || 'Cliente' }}</span>
                  </div>

                  <div>
                    <span class="boleta-etiqueta">Email</span>
                    <span>: {{ f.email || 'No disponible' }}</span>
                  </div>

                  <div>
                    <span class="boleta-etiqueta">Orden de Compra</span>
                    <span>: #{{ f.ordenId }}</span>
                  </div>

                  <div>
                    <span class="boleta-etiqueta">Estado</span>
                    <span>: {{ f.estado }}</span>
                  </div>

                </div>

                <!-- DETALLE DE PRODUCTOS -->
                <div class="boleta-tabla-scroll">
                  <table class="boleta-tabla">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th class="boleta-col-descripcion">Descripción</th>
                        <th class="boleta-num">Precio</th>
                        <th class="boleta-num">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (d of f.detalles || []; track d.id) {
                        <tr>
                          <td>{{ d.productoId }}</td>
                          <td>{{ d.cantidad }}</td>
                          <td class="boleta-col-descripcion">{{ d.nombreProducto }}</td>
                          <td class="boleta-num">
                            {{ d.precioUnitario | currency:'CLP':'symbol-narrow':'1.0-0' }}
                          </td>
                          <td class="boleta-num">
                            {{ d.subtotal | currency:'CLP':'symbol-narrow':'1.0-0' }}
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5">No hay productos para mostrar.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- TOTALES TRIBUTARIOS -->
                <div class="boleta-totales">

                  <div>
                    <span>Neto</span>
                    <span>{{ netoDe(f) | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                  </div>

                  <div>
                    <span>IVA (19%)</span>
                    <span>{{ ivaDe(f) | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                  </div>

                  <div class="boleta-total">
                    <span>Total</span>
                    <span>{{ f.total | currency:'CLP':'symbol-narrow':'1.0-0' }}</span>
                  </div>

                </div>

                <p class="boleta-leyenda">
                  Documento de prueba – sin validez tributaria.
                  Proyecto académico Pedidos360 / FullSport360.
                </p>

              </div>
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
  `,
  styles: [`
    .boleta-modal {
      max-width: 760px;
      width: 95%;
    }

    .boleta {
      font-size: 0.85rem;
      color: #111827;
    }

    .boleta-encabezado {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .boleta-emisor {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      color: #374151;
    }

    .boleta-emisor strong {
      font-size: 0.95rem;
      color: #111827;
    }

    .boleta-recuadro {
      border: 3px solid #dc2626;
      color: #dc2626;
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      font-weight: 700;
      text-align: center;
      min-width: 210px;
    }

    .boleta-recuadro strong {
      font-size: 1rem;
    }

    .boleta-receptor {
      border: 1px solid #111827;
      padding: 0.6rem 0.8rem;
      margin-bottom: 1rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem 1rem;
    }

    .boleta-etiqueta {
      display: inline-block;
      min-width: 120px;
      font-weight: 700;
    }

    .boleta-tabla-scroll {
      overflow-x: auto;
    }

    .boleta-tabla {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    .boleta-tabla th,
    .boleta-tabla td {
      border: 1px solid #111827;
      padding: 0.4rem 0.5rem;
      text-align: center;
    }

    .boleta-tabla th {
      background: #f3f4f6;
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .boleta-tabla .boleta-col-descripcion {
      text-align: left;
    }

    .boleta-tabla .boleta-num {
      text-align: right;
    }

    .boleta-totales {
      margin-left: auto;
      width: 260px;
      border: 1px solid #111827;
      padding: 0.6rem 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .boleta-totales div {
      display: flex;
      justify-content: space-between;
    }

    .boleta-total {
      border-top: 1px solid #d1d5db;
      padding-top: 0.35rem;
      font-weight: 700;
      font-size: 0.95rem;
    }

    .boleta-leyenda {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.75rem;
      color: #6b7280;
    }

    @media (max-width: 640px) {
      .boleta-encabezado {
        flex-direction: column;
      }

      .boleta-receptor {
        grid-template-columns: 1fr;
      }

      .boleta-totales {
        width: 100%;
      }
    }
  `]
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

  // DESGLOSE TRIBUTARIO
  // Usa lo calculado por ms-facturacion; si es una factura antigua
  // (sin neto/iva guardados), lo calcula a partir del total (IVA 19% incluido).
  netoDe(f: Factura): number {
    return f.neto ?? Math.round(f.total / 1.19);
  }

  ivaDe(f: Factura): number {
    return f.iva ?? (f.total - this.netoDe(f));
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