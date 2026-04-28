import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG modules */
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card'
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TableModule
  ],
  exports: [
    ButtonModule,
    InputTextModule,
    CardModule,
    TableModule
  ]
})
export class PrimeImportsModule {}
