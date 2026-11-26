
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

  // Opcional: permite comprar sin cupones.
  codigoCupon?: string;

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

  // Informacion de descuentos.
  subtotal: number | null;
  codigoCupon: string | null;
  descuento: number | null;

  // Importe definitivo de la orden.
  total: number;

  estado: string;
  fechaCreacion: string;
  items: OrdenItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/api/ordenes`;

  // Crear una orden con o sin cupon.
  crear(orden: OrdenRequest) {
    return this.http.post<Orden>(
      this.baseUrl,
      orden
    );
  }

  // Consultar las ordenes del usuario autenticado.
  obtenerMisOrdenes() {
    return this.http.get<Orden[]>(
      `${this.baseUrl}/mis-ordenes`
    );
  }

  // Consultar el detalle de una orden.
  obtenerPorId(id: number) {
    return this.http.get<Orden>(
      `${this.baseUrl}/${id}`
    );
  }
}
