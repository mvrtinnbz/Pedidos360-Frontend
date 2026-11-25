import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AnalyticsService, TopProducto } from '../services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="dash-container">

      <div class="dash-header">
        <div>
          <h1>Dashboard de analítica</h1>
          <p class="dash-sub">Datos en vivo desde Kafka y DynamoDB</p>
        </div>
        <span class="estado" [class.online]="analytics.conectado()">
          {{ analytics.conectado() ? '● En vivo' : '○ Reconectando...' }}
        </span>
      </div>

      @if (analytics.metricas(); as m) {

        <!-- Metrica 1: totales -->
        <section class="kpis">
          <div class="kpi">
            <span class="kpi-label">Vistas de productos</span>
            <strong>{{ m.totales.vistas | number:'1.0-0':'es-CL' }}</strong>
          </div>
          <div class="kpi">
            <span class="kpi-label">Agregados al carrito</span>
            <strong>{{ m.totales.agregados | number:'1.0-0':'es-CL' }}</strong>
          </div>
          <div class="kpi">
            <span class="kpi-label">Interacciones totales</span>
            <strong>{{ m.totales.interacciones | number:'1.0-0':'es-CL' }}</strong>
          </div>
          <div class="kpi">
            <span class="kpi-label">Productos con actividad</span>
            <strong>{{ m.totales.productosConActividad }}</strong>
          </div>
        </section>

        <div class="columnas">

          <!-- Metrica 2: mas vistos -->
          <section class="panel">
            <h2>Productos más vistos</h2>
            @for (p of m.masVistos; track p.productoId) {
              <div class="barra-fila">
                <div class="barra-texto">
                  <span>{{ p.nombre }}</span>
                  <strong>{{ p.cantidad }}</strong>
                </div>
                <div class="barra-fondo">
                  <div class="barra azul" [style.width.%]="porcentaje(p, m.masVistos)"></div>
                </div>
              </div>
            } @empty {
              <p class="vacio">Aún no hay vistas registradas.</p>
            }
          </section>

          <!-- Metrica 3: mas agregados al carrito -->
          <section class="panel">
            <h2>Más agregados al carrito</h2>
            @for (p of m.masAgregados; track p.productoId) {
              <div class="barra-fila">
                <div class="barra-texto">
                  <span>{{ p.nombre }}</span>
                  <strong>{{ p.cantidad }}</strong>
                </div>
                <div class="barra-fondo">
                  <div class="barra verde" [style.width.%]="porcentaje(p, m.masAgregados)"></div>
                </div>
              </div>
            } @empty {
              <p class="vacio">Aún no hay productos agregados al carrito.</p>
            }
          </section>
        </div>

        <p class="actualizado">Última actualización: {{ m.actualizado | date:'mediumTime' }}</p>

      } @else {
        <p class="vacio">Cargando métricas...</p>
      }
    </div>
  `,
  styles: [`
    .dash-container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .dash-header h1 { margin: 0; font-size: 1.6rem; color: var(--text-primary); }
    .dash-sub { margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.9rem; }

    .estado { font-weight: 600; font-size: 0.85rem; color: var(--danger-red); }
    .estado.online { color: var(--success-green); }

    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .kpi-label { color: var(--text-secondary); font-size: 0.85rem; }
    .kpi strong { font-size: 1.8rem; color: var(--text-primary); }

    .columnas { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 760px) { .columnas { grid-template-columns: 1fr; } }

    .panel { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; }
    .panel h2 { margin: 0 0 1rem; font-size: 1.1rem; color: var(--text-primary); }

    .barra-fila { margin-bottom: 0.9rem; }
    .barra-texto { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.3rem; color: var(--text-primary); }
    .barra-fondo { height: 10px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
    .barra { height: 100%; border-radius: 6px; transition: width 0.4s ease; }
    .barra.azul { background: var(--accent-blue); }
    .barra.verde { background: var(--success-green); }

    .vacio, .actualizado { color: var(--text-secondary); font-size: 0.9rem; }
    .actualizado { text-align: right; margin-top: 1rem; }
  `]
})
export class Dashboard implements OnInit, OnDestroy {

  analytics = inject(AnalyticsService);

  ngOnInit(): void {
    this.analytics.conectar();
  }

  ngOnDestroy(): void {
    this.analytics.desconectar();
  }

  // Ancho de la barra relativo al producto con mas interacciones
  porcentaje(p: TopProducto, lista: TopProducto[]): number {
    const maximo = Math.max(...lista.map((x) => x.cantidad), 1);
    return (p.cantidad / maximo) * 100;
  }
}