import { Injectable, inject, signal } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { Producto } from './producto.service';

export interface TopProducto {
  productoId: number;
  nombre: string;
  categoria: string;
  cantidad: number;
}

export interface Metricas {
  masVistos: TopProducto[];
  masAgregados: TopProducto[];
  totales: {
    vistas: number;
    agregados: number;
    interacciones: number;
    productosConActividad: number;
  };
  actualizado: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  // Con interceptor MSAL (envia el token si hay sesion)
  private http = inject(HttpClient);

  // Sin interceptor: para visitantes sin sesion (evita que MSAL pida login)
  private httpPublico = new HttpClient(inject(HttpBackend));

  private msalService = inject(MsalService);

  private baseUrl = `${environment.apiUrl}/api/analytics`;

  // Estado del dashboard (se actualiza solo cuando llega un mensaje del WebSocket)
  metricas = signal<Metricas | null>(null);
  conectado = signal(false);

  private ws: WebSocket | null = null;
  private cerrado = false;
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  private haySesion(): boolean {
    const instancia = this.msalService.instance;
    return !!(instancia.getActiveAccount() ?? instancia.getAllAccounts()[0]);
  }

  // Con sesion recomienda segun el usuario; sin sesion, los mas populares
  getRecomendaciones() {
    const cliente = this.haySesion() ? this.http : this.httpPublico;
    return cliente.get<Producto[]>(`${this.baseUrl}/recomendaciones`);
  }

  // Carga inicial por HTTP (por si el WebSocket tarda en conectar)
  cargarMetricas() {
    this.httpPublico.get<Metricas>(`${this.baseUrl}/metricas`).subscribe({
      next: (m) => this.metricas.set(m),
      error: () => {}
    });
  }

  // ===== WebSocket =====

  private urlWebSocket(): string {
    if (environment.wsUrl) {
      return environment.wsUrl;
    }
    const protocolo = location.protocol === 'https:' ? 'wss://' : 'ws://';
    return `${protocolo}${location.host}/ws/metricas`;
  }

  conectar(): void {
    this.cerrado = false;
    this.cargarMetricas();
    this.abrir();
  }

  private abrir(): void {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(this.urlWebSocket());

    this.ws.onopen = () => this.conectado.set(true);

    this.ws.onmessage = (evento) => {
      try {
        this.metricas.set(JSON.parse(evento.data) as Metricas);
      } catch {
        // mensaje invalido: se ignora
      }
    };

    this.ws.onclose = () => {
      this.conectado.set(false);
      this.ws = null;
      // Reintenta cada 3 segundos mientras el dashboard siga abierto
      if (!this.cerrado) {
        this.temporizador = setTimeout(() => this.abrir(), 3000);
      }
    };

    this.ws.onerror = () => this.ws?.close();
  }

  desconectar(): void {
    this.cerrado = true;
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
    this.ws?.close();
    this.ws = null;
    this.conectado.set(false);
  }
}