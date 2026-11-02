import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface IniciarWebpayResponse {
  pagoId: number;
  estado: string;          // PENDIENTE | BLOQUEADO_FRAUDE
  url: string | null;
  token: string | null;
  detalle: string;
}

export interface Pago {
  id: number;
  ordenId: number;
  usuarioId: string;
  monto: number;
  metodo: string;          // WEBPAY | SIMULADO
  estado: string;          // PENDIENTE | APROBADO | RECHAZADO | BLOQUEADO_FRAUDE
  tarjetaUltimos4: string | null;
  detalle: string;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class PagoService {

  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/api/pagos`;

  // Crea la transaccion en Webpay (ms-pago obtiene el monto desde ms-orders).
  iniciarWebpay(ordenId: number) {
    return this.http.post<IniciarWebpayResponse>(`${this.baseUrl}/webpay/iniciar`, { ordenId });
  }

  // Pagos de una orden (para mostrar el resultado real, sin confiar en la URL).
  obtenerPorOrden(ordenId: number) {
    return this.http.get<Pago[]>(`${this.baseUrl}/orden/${ordenId}`);
  }

  // Webpay recibe el token por POST en el campo "token_ws":
  // se arma un formulario oculto y se envia (asi lo hacen las tiendas reales).
  redirigirAWebpay(url: string, token: string): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }
}