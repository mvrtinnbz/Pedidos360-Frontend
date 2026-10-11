
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

export interface FacturaDetalle {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Factura {
  id: number;
  ordenId: number;
  numeroFactura: string;
  usuarioId: string;
  email: string;
  total: number;
  estado: string;
  fechaEmision: string;
  detalles: FacturaDetalle[];
}

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private http = inject(HttpClient);
  private msalService = inject(MsalService);

  private baseUrl = `${environment.apiUrl}/api/facturas`;

  obtenerMisFacturas() {
    const account =
      this.msalService.instance.getActiveAccount() ??
      this.msalService.instance.getAllAccounts()[0];

    if (!account) {
      throw new Error('Debes iniciar sesión para consultar tus facturas.');
    }

    const usuarioId = encodeURIComponent(account.username);

    return this.http.get<Factura[]>(
      `${this.baseUrl}/usuario/${usuarioId}`
    );
  }

  obtenerPorId(id: number) {
    return this.http.get<Factura>(`${this.baseUrl}/${id}`);
  }

  obtenerPorOrden(ordenId: number) {
    return this.http.get<Factura>(
      `${this.baseUrl}/orden/${ordenId}`
    );
  }
}
