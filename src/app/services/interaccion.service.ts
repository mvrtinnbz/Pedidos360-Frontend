import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { Producto } from './producto.service';

// Registra las interacciones del cliente para la analitica (Kafka: topico tienda.eventos).
// Son llamadas "en segundo plano": si fallan, la tienda sigue funcionando igual.
@Injectable({ providedIn: 'root' })
export class InteraccionService {

  // Con interceptor MSAL (envia el token) -> se registra el usuario
  private http = inject(HttpClient);

  // Sin interceptor -> para visitantes sin sesion
  private httpPublico = new HttpClient(inject(HttpBackend));

  private msalService = inject(MsalService);

  private apiUrl = environment.apiUrl;

  private haySesion(): boolean {
    const instancia = this.msalService.instance;
    return !!(instancia.getActiveAccount() ?? instancia.getAllAccounts()[0]);
  }

  // ms-productos -> PRODUCTO_VISTO (con o sin sesion)
  registrarVista(productoId: number): void {
    const cliente = this.haySesion() ? this.http : this.httpPublico;

    cliente.post(`${this.apiUrl}/api/productos/${productoId}/vista`, null)
      .subscribe({ error: () => {} });
  }

  // ms-carrito -> PRODUCTO_AGREGADO_CARRITO (solo con sesion)
  registrarAgregadoCarrito(producto: Producto): void {
    if (!this.haySesion()) {
      return;
    }

    this.http.post(`${this.apiUrl}/api/carrito/interaccion`, {
      productoId: producto.id,
      nombreProducto: producto.nombre,
      categoria: producto.categoria ?? null
    }).subscribe({ error: () => {} });
  }
}
