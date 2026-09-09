import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CarritoItem {
  id: number;
  usuarioId: string;
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/carrito`;

  getByUsuario(usuarioId: string) {
    return this.http.get<CarritoItem[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  agregar(item: Partial<CarritoItem>) {
    return this.http.post<CarritoItem>(this.baseUrl, item);
  }

  eliminarItem(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}