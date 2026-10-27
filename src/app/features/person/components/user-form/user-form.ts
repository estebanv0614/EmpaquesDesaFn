import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../core/services/user-service';
import { Rol } from '../../../../shared/models/rol.model';
import { RolService } from '../../../../core/services/rol-service';
import { Person } from '../../../../shared/models/person.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  @Input() person: Person | null = null;
  @Output() closed = new EventEmitter<boolean>();

  visible = true;
  guardando = signal(false);
  roles = signal<Rol[]>([]);
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private rolService: RolService,
    private messageService: MessageService,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: [null, Validators.required],
      activo: [true],
    });
  }

  ngOnInit(): void {
    this.rolService.getAll().subscribe({
      next: (r) => this.roles.set(r),
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los roles',
        });
      },
    });
  }

  onSave(): void {
    if (this.form.invalid || !this.person) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const v = this.form.value;
    this.userService
      .create({
        person: { id: this.person.id },
        username: v.username,
        password: v.password,
        activo: v.activo,
        roles: [v.rol],
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario creado correctamente',
          });
          this.closeDialog(true);
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail:
              err.status === 403
                ? 'No tienes permisos para crear usuarios (rol ADMIN requerido)'
                : 'No se pudo crear el usuario',
          });
        },
      });
  }

  closeDialog(saved: boolean = false): void {
    this.visible = false;
    this.closed.emit(saved);
  }
}
