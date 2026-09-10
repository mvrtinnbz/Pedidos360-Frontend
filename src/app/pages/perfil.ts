import { Component, OnInit, inject } from '@angular/core';
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

      @if (perfil) {
        <div class="cart-summary-card">
          <div class="summary-row">
            <span>Nombre</span>
            <span>{{ perfil.nombre }}</span>
          </div>
          <div class="summary-row">
            <span>Correo</span>
            <span>{{ perfil.email }}</span>
          </div>
        </div>
      } @else if (error) {
        <p>No se pudo cargar el perfil. Verifica que hayas iniciado sesión.</p>
      } @else {
        <p>Cargando...</p>
      }
    </div>
  `
})
export class Perfil implements OnInit {
  private perfilService = inject(PerfilService);

  perfil: PerfilData | null = null;
  error = false;

  ngOnInit(): void {
    this.perfilService.getMe().subscribe({
      next: (data) => this.perfil = data,
      error: () => this.error = true
    });
  }
}