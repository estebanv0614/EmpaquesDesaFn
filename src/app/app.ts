import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeImportsModule } from './prime-imports/prime-imports-module';
import { LoadingOverlay } from './shared/components/loading-overlay/loading-overlay';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PrimeImportsModule, LoadingOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('EmpaquesDesaFn');
}
