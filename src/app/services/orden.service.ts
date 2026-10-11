
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

export interface OrdenItem {
  id: number;
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Orden {
  id: number;
  usuarioId: string;
  email: string;
  total: number;
  estado: string;
  fechaCreacion: string;
  items: OrdenItem[];
}

@Injectable({ providedIn: 'root' })
export class OrdenService {

  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/api/ordenes`;

  // Crear una orden.
  crear(orden: OrdenRequest) {
    return this.http.post<Orden>(this.baseUrl, orden);
  }

  // Consultar únicamente las órdenes del usuario autenticado.
  obtenerMisOrdenes() {
    return this.http.get<Orden[]>(`${this.baseUrl}/mis-ordenes`);
  }

  // Consultar el detalle de una orden.
  obtenerPorId(id: number) {
    return this.http.get<Orden>(`${this.baseUrl}/${id}`);
  }
}
