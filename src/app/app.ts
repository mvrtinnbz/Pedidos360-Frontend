import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  protected readonly title = signal('pedidos360');

  constructor(private msalService: MsalService) {}

  ngOnInit(): void {
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          console.log('Login exitoso:', result);
        }
      },
      error: (error) => {
        console.error('Error de autenticación MSAL:', error);
      }
    });
  }
}