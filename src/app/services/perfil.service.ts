import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Perfil {
  nombre: string;
  email: string;
  aud?: string[];
  iss?: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/profile`;

  getMe() {
    return this.http.get<Perfil>(`${this.baseUrl}/me`);
  }
}