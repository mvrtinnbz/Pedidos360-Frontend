import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface OrdenItemRequest {
  productoId: number;
  cantidad: number;
}

export interface OrdenRequest {
  usuarioId: string;
  email: string;
  items: OrdenItemRequest[];
}

export interface Orden {
  id: number;
  usuarioId: string;
  email: string;
  total: number;
  estado: string;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class OrdenService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/ordenes`;

  // ms-orders valida precio y stock contra ms-productos y publica "orden.creada" en RabbitMQ.
  crear(orden: OrdenRequest) {
    return this.http.post<Orden>(this.baseUrl, orden);
  }
}