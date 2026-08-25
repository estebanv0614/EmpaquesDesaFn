import { Component, signal } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SolicitudCotizacionService } from '../../../../core/services/solicitud-cotizacion.service';
import { SolicitudCotizacionRequest } from '../../../../shared/models/solicitud-cotizacion-request.model';


@Component({
  selector: 'app-solicitud-form',
  standalone: true,
  imports: [
    PrimeImportsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './solicitud-form.html',
  styleUrl: './solicitud-form.css',
})
export class SolicitudForm {
  form: FormGroup;
  enviando = signal(false);
  enviado = signal(false);

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudCotizacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    // Si venimos de "Solicitar cotización" en una bolsa del catálogo,
    // se prellena el primer producto con la bolsa seleccionada.
    const productoPreseleccionado = (history.state?.producto as string) || '';

    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      mail: ['', Validators.email],
      city: [''],
      address: [''],
      observacion: [''],
      detalles: this.fb.array([this.crearDetalle(productoPreseleccionado)])
    });
  }
  get detalles(): FormArray {
      return this.form.get('detalles') as FormArray;
    }
  
  crearDetalle(descripcionProducto: string = ''): FormGroup{
    return  this.fb.group({
      descripcionProducto: [descripcionProducto, Validators.required],
      cantidadEstimada: ['']
    });
  }

  agregarDetalle(): void {
    this.detalles.push(this.crearDetalle());
  }

  eliminarDetalle(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.enviando());
  }

  isDetalleInvalid(index: number, controlName: string): boolean {
    const control = this.detalles.at(index).get(controlName);
    return !!control?.invalid && (control.touched || this.enviando());
  }

  onSubmit(): void {
    this.enviando.set(true);

    if(this.form.invalid) {
      this.form.markAllAsTouched();
      this.enviando.set(false);
      return;
    }
    const payload: SolicitudCotizacionRequest = this.form.value;

    this.solicitudService.create(payload).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Solicitud enviada',
          detail: 'Nos pondremos en contacto contigo pronto. ',
        });
        this.form.reset();
        this.detalles.clear();
        this.detalles.push(this.crearDetalle());
      },
      error: (err) => {
        console.error(err);
        this.enviando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo enviar la solicitud. Intenta de nuevo',
        });
      },
    });
  }
}
