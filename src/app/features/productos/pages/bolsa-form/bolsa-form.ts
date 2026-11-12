import { Component, EventEmitter, Input, OnInit, Output, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { BolsaService } from '../../../../core/services/bolsa.service';
import { EstadoService } from '../../../../core/services/estado-service';
import { Bolsa } from '../../../../shared/models/bolsa.model';
import { Estado } from '../../../../shared/models/estado.model';
import { filter } from 'rxjs';

@Component({
  selector: 'app-bolsa-form',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './bolsa-form.html',
  styleUrl: './bolsa-form.css',
})
export class BolsaForm {
  @Input() bolsa: Bolsa | null = null;
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  form: FormGroup;
  estados = signal<Estado[]>([]);
  isEditMode = false;
  enviado = signal(false);
  enviando = signal(false);

  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;
  arrastrando = signal(false);
  errorImagen = signal<string | null>(null);

  private imagenOriginal: string | null = null;
  private readonly TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly MAX_BYTES = 5 * 1024 * 1024;

  private readonly ESTADOS_PERMITIDOS = ['ACTIVO', 'CANCELADO'];

  estadosFiltrados = computed(() =>
    this.estados().filter((e) => this.ESTADOS_PERMITIDOS.includes(e.name.toUpperCase())),
  );

  constructor(
    private fb: FormBuilder,
    private bolsaService: BolsaService,
    private estadoService: EstadoService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      tipo: ['', Validators.required],
      anchoCm: [null, [Validators.required, Validators.min(0.01)]],
      largoCm: [null, [Validators.required, Validators.min(0.01)]],
      calibre: [null, [Validators.required, Validators.min(0.01)]],
      precioBase: [null, [Validators.required, Validators.min(0)]],
      estado: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.estadoService.getAll().subscribe({
      next: (data) => this.estados.set(data),
      error: (err) => console.error(err),
    });

    if (this.bolsa) {
      this.isEditMode = true;
      this.form.patchValue(this.bolsa);
      if (this.bolsa.imagenUrl) {
        this.imagenOriginal = this.bolsaService.getImagenUrl(this.bolsa.imagenUrl);
        this.previewUrl = this.imagenOriginal;
      }
    }
  }

  ngOnDestroy(): void {
    this.liberarPreview();
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.enviando());
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.procesarArchivo(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.procesarArchivo(file);
  }

  quitarImagen(): void {
    this.liberarPreview();
    this.archivoSeleccionado = null;
    this.previewUrl = this.imagenOriginal;
    this.errorImagen.set(null);
  }

  private procesarArchivo(file: File): void {
    if (!this.TIPOS_PERMITIDOS.includes(file.type)) {
      this.errorImagen.set('Solo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }
    if (file.size > this.MAX_BYTES) {
      this.errorImagen.set('La imagen no puede superar los 5 MB.');
      return;
    }
    this.errorImagen.set(null);
    this.liberarPreview();
    this.archivoSeleccionado = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  private liberarPreview(): void {
    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  private buildFormData(): FormData {
    const value = this.form.value;
    const formData = new FormData();

    formData.append('name', value.name ?? '');
    formData.append('description', value.description ?? '');
    formData.append('tipo', value.tipo ?? '');
    if (value.anchoCm != null) formData.append('anchoCm', value.anchoCm.toString());
    if (value.largoCm != null) formData.append('largoCm', value.largoCm.toString());
    if (value.calibre != null) formData.append('calibre', value.calibre.toString());
    formData.append('precioBase', value.precioBase.toString());
    formData.append('idEstado', value.estado?.id?.toString() ?? '');

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }
    return formData;
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const formData = this.buildFormData();
    const request = this.isEditMode
      ? this.bolsaService.update(this.bolsa!.id!, formData)
      : this.bolsaService.create(formData);

    request.subscribe({
      next: () => {
        this.enviando.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode ? 'Bolsa actualizada' : 'Bolsa creada',
        });
        this.closeDialog(true);
      },
      error: (err) => {
        this.enviando.set(false);
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar',
        });
      },
    });
  }

  closeDialog(saved: boolean = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
