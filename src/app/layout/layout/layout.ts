import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { WhatsappButton } from '../../shared/components/whatsapp-button/whatsapp-button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, WhatsappButton],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
