import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { MessageService, ConfirmationService } from 'primeng/api';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { authErrorInterceptor } from './core/interceptors/auth-error-interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-CO';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeEs);


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor, authErrorInterceptor, loadingInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
    MessageService,
    ConfirmationService
  ],
};