
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface SolicitudDescuento {
  codigo: string;
  subtotal: number;
}

export interface ResultadoDescuento {
  codigo: string;
  porcentajeDescuento: number;
  subtotal: number;
  descuento: number;
  totalFinal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CuponesService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/api/cupones`;

  calcularDescuento(
    codigo: string,
    subtotal: number
  ): Observable<ResultadoDescuento> {

    const solicitud: SolicitudDescuento = {
      codigo: codigo.trim().toUpperCase(),
      subtotal
    };

    return this.http.post<ResultadoDescuento>(
      `${this.apiUrl}/calcular`,
      solicitud
    );
  }
}