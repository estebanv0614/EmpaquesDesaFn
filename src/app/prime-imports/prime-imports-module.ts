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
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonDirective } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CarouselModule } from 'primeng/carousel';
import { DatePickerModule } from 'primeng/datepicker';


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
    SelectModule,
    TagModule,
    TooltipModule,
    ButtonDirective,
    TextareaModule,
    CarouselModule,
    DatePickerModule
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
    SelectModule,
    TagModule,
    TooltipModule,
    ButtonDirective,
    TextareaModule,
    CarouselModule,
    DatePickerModule
  ]
})
export class PrimeImportsModule {}
