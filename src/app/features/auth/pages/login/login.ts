import { Component, OnInit } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../../../core/services/auth';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  exampleForm: FormGroup;
  formSubmitted = false;
  visible: boolean = false;

  constructor(
    private messageService: MessageService,
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
  ) {
    this.exampleForm = fb.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/),
        ],
      ],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    this.formSubmitted = true;

    if (this.exampleForm.invalid) {
      console.log('Formulario inválido', this.exampleForm.errors);
      return;
    }
    const { username, password } = this.exampleForm.value;
    this.auth.login(username, password).subscribe({
      next: (response) => {
        console.log('Login OK', response);
        // No hace falta el localStorage.setItem aquí, tu Auth service ya lo guarda
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Inicio de sesión correcto',
        });
        this.router.navigate(['/home']); // ahora sí lo usamos
      },
      error: (err) => {
        console.error('Login error', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? 'Usuario o contraseña incorrectos',
        });
      },
    });
  }

  isInvalid(controlName: string) {
    const control = this.exampleForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  testClick() {
    console.log('Botón clickeado');
  }
}
