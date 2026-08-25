import { Component, inject } from '@angular/core';
import { PrimeImportsModule } from '../../../prime-imports/prime-imports-module';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [PrimeImportsModule],
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.css',
})
export class LoadingOverlay {
  loadingService = inject(LoadingService);

  reintentar(): void {
    window.location.reload();
  }
}
