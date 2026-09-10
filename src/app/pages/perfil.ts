import { Component, OnInit, inject, signal } from '@angular/core';
import { PerfilService, Perfil as PerfilData } from '../services/perfil.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Mi Perfil</h1>
      </div>

      @if (perfil(); as p) {
        <div class="cart-summary-card">
          <div class="summary-row">
            <span>Nombre</span>
            <span>{{ p.nombre }}</span>
          </div>
          <div class="summary-row">
            <span>Correo</span>
            <span>{{ p.email }}</span>
          </div>
        </div>
      } @else if (error()) {
        <p>No se pudo cargar el perfil. Verifica que hayas iniciado sesión.</p>
      } @else {
        <p>Cargando...</p>
      }
    </div>
  `
})
export class Perfil implements OnInit {
  private perfilService = inject(PerfilService);

  perfil = signal<PerfilData | null>(null);
  error = signal(false);

  ngOnInit(): void {
    this.perfilService.getMe().subscribe({
      next: (data) => this.perfil.set(data),
      error: () => this.error.set(true)
    });
  }
}