import { ApplicationConfig, importProvidersFrom, provideAppInitializer, inject } from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

import {
  MsalModule,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MsalInterceptor,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation
} from '@azure/msal-browser';


// ================================
// Configuración principal de MSAL
// ================================

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'd0261291-fbfe-40fb-b1b0-fae49a04f31f',
      authority:
        'https://login.microsoftonline.com/0844a9ad-f458-47d0-8036-0f2080309ddc',
      redirectUri: environment.frontendUrl,
      postLogoutRedirectUri: environment.frontendUrl
    },

    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    }
  });
}


// ================================
// Configuración del Guard
// ================================

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,

    authRequest: {
      scopes: [
        'api://9415422a-7394-44ca-a7fb-911e767844a8/access_as_user'
      ]
    },

    loginFailedRoute: '/login-failed'
  };
}


// ================================
// Configuración del Interceptor
// ================================

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {

  const protectedResourceMap =
    new Map<string, Array<string>>();

  protectedResourceMap.set(
    environment.apiUrl + '/api/',
    [
      'api://9415422a-7394-44ca-a7fb-911e767844a8/access_as_user'
    ]
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}


// ================================
// Configuración de Angular
// ================================

export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    importProvidersFrom(
      MsalModule
    ),

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },

    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },

    {
      provide: MsalService,
      useClass: MsalService
    },

    {
      provide: MsalGuard,
      useClass: MsalGuard
    },

    {
      provide: MsalBroadcastService,
      useClass: MsalBroadcastService
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },

    // Inicializa MSAL antes de que cualquier componente
    // intente leer la sesión (evita "uninitialized_public_client_application")
    provideAppInitializer(() => {
      const msalInstance = inject(MSAL_INSTANCE);
      return msalInstance.initialize();
    })
  ]
};