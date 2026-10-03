import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { WhatsappButton } from '../../shared/components/whatsapp-button/whatsapp-button';
import { ChatWidget } from '../components/chat-widget/chat-widget';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, WhatsappButton, ChatWidget],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
