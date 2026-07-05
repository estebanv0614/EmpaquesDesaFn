import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* PrimeNG modules */
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card'
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TableModule,
    ToastModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    PasswordModule,
    MessageModule,
    ConfirmDialogModule,
    DialogModule,
    SelectModule
  ],
  exports: [
    ButtonModule,
    InputTextModule,
    CardModule,
    TableModule,
    ToastModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    PasswordModule,
    MessageModule,
    ConfirmDialogModule,
    DialogModule,
    SelectModule
  ]
})
export class PrimeImportsModule {}
