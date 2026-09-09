import { Injectable, signal, inject } from '@angular/core';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import { filter } from 'rxjs/operators';

export interface Alerta {
  mensaje: string;
  tipo: 'success' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);

  isLoggedIn = signal<boolean>(false);
  alerta = signal<Alerta | null>(null);

  constructor() {
    this.actualizarEstado();

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) =>
          msg.eventType === EventType.LOGIN_SUCCESS ||
          msg.eventType === EventType.LOGOUT_SUCCESS ||
          msg.eventType === EventType.LOGOUT_END ||
          msg.eventType === EventType.ACTIVE_ACCOUNT_CHANGED ||
          msg.eventType === EventType.HANDLE_REDIRECT_END
        )
      )
      .subscribe(() => {
        this.actualizarEstado();
      });
  }

  public actualizarEstado(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    const allAccounts = this.msalService.instance.getAllAccounts();
    this.isLoggedIn.set(!!activeAccount || allAccounts.length > 0);
  }

  public mostrarNotificacion(mensaje: string, tipo: 'success' | 'info' = 'info'): void {
    this.alerta.set({ mensaje, tipo });

    setTimeout(() => {
      this.alerta.set(null);
    }, 3500);
  }
}