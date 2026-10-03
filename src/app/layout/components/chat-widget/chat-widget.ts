import { Component, inject } from '@angular/core';
import { ChatWidgetService } from '../../../shared/services/chat-widget';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

interface QuickQuestion {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css',
})
export class ChatWidget {
  chat = inject(ChatWidgetService);

  messages: ChatMessage[] = [
    { from: 'bot', text: '¡Hola! Soy el asistente de Empaques Desa. ¿En qué te puedo ayudar?' },
  ];

  quickQuestions: QuickQuestion[] = [
    {
      question: '¿Cuál es el pedido mínimo?',
      answer: 'Para pedidos al detal no manejamos mínimo. Para mayoristas, el mínimo es de 1.000 bolsas.',
    },
    {
      question: '¿Cuánto tarda mi pedido?',
      answer: 'Entre 1 y 15 días hábiles, dependiendo de la cantidad.',
    },
    {
      question: '¿Hacen envíos a nivel nacional?',
      answer: 'Sí, enviamos a todo el país mediante transportadora.',
    },
    {
      question: '¿Cómo solicito una cotización?',
      answer: 'Puedes usar el botón "Solicitar cotización" en el menú, o escríbenos por WhatsApp.',
    },
    {
      question: 'Quiero hablar con una persona',
      answer: 'Claro, escríbenos por WhatsApp al +57 321 382 6385 o al +57 310 861 2970 y te atendemos directamente.',
    },
  ];

  ask(item: QuickQuestion) {
    this.messages.push({ from: 'user', text: item.question });
    this.messages.push({ from: 'bot', text: item.answer });
  }

  close() {
    this.chat.close();
  }
}
