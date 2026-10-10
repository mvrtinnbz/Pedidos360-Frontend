import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpBackend
} from '@angular/common/http';

import { environment } from '../../environments/environment';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {

  // Cliente HTTP normal de Angular
  private http = inject(HttpClient);

  // Cliente HTTP sin interceptores para consultas publicas
  private httpPublico = new HttpClient(inject(HttpBackend));

  private baseUrl = `${environment.apiUrl}/api/productos`;

  getAll() {
    return this.httpPublico.get<Producto[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.httpPublico.get<Producto>(
      `${this.baseUrl}/${id}`
    );
  }
}
