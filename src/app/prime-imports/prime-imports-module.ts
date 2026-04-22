import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG modules */
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    CardModule
  ],
  exports: [
    ButtonModule,
    InputTextModule,
    CardModule
  ]
})
export class PrimeImportsModule {}
