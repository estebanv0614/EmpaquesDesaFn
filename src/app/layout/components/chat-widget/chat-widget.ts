import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ChatService } from '../../../core/services/chat.service';

interface ChatLink {
  label: string;
  url: string;
  icon: string;
}

interface Message {
  from: 'user' | 'bot';
  text: string;
  time: string;
  links?: ChatLink[];
}

interface QuickQuestion {
  question: string;
  answer: string;
  links?: ChatLink[];
}

const WHATSAPP_1: ChatLink = {
  label: 'WhatsApp +57 321 382 6385',
  url: 'https://wa.me/573213826385',
  icon: 'pi pi-whatsapp',
};

const WHATSAPP_2: ChatLink = {
  label: 'WhatsApp +57 310 861 2970',
  url: 'https://wa.me/573108612970',
  icon: 'pi pi-whatsapp',
};

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [ButtonModule, AvatarModule, DividerModule],
  templateUrl: './chat-widget.html',
})
export class ChatWidget {
  chat = inject(ChatService);

  @ViewChild('body') body?: ElementRef<HTMLElement>;

  typing = signal(false);
  messages = signal<Message[]>(this.initialMessages());

  private replyTimer?: ReturnType<typeof setTimeout>;

  quickQuestions: QuickQuestion[] = [
    {
      question: '¿Cuál es el pedido mínimo?',
      answer:
        'Vendemos al por mayor y al detal. El pedido mínimo depende del tipo de bolsa, tamaño y calibre. Escríbenos con la referencia que te interesa y te confirmamos cantidad y precio por unidad.',
      links: [WHATSAPP_1],
    },
    {
      question: '¿Cuánto tarda mi pedido?',
      answer:
        'Los productos en inventario se despachan en 1 a 3 días hábiles. Los pedidos personalizados tardan entre 8 y 15 días hábiles, según la cantidad.',
    },
    {
      question: '¿Hacen envíos a nivel nacional?',
      answer:
        'Sí, enviamos a todo el país desde Bogotá. El costo y el tiempo dependen de la ciudad y del peso del pedido; te los informamos con la cotización.',
    },
    {
      question: '¿Cómo solicito una cotización?',
      answer:
        'Entra a "Solicitar cotización" en el menú superior, elige los productos y envía tu solicitud. También puedes escribirnos por WhatsApp.',
      links: [WHATSAPP_1, WHATSAPP_2],
    },
    {
      question: '¿Cuál es el horario de atención?',
      answer: 'Lunes a viernes: 8:00 a.m. - 6:00 p.m.\nSábados: 9:00 a.m. - 2:00 p.m.',
    },
    {
      question: '¿Dónde están ubicados?',
      answer: 'Estamos en Calle 34 sur 68i-99, Bogotá D.C.',
      links: [
        {
          label: 'Ver en Google Maps',
          url: 'https://www.google.com/maps/search/?api=1&query=Calle+34+sur+68i-99+Bogota',
          icon: 'pi pi-map-marker',
        },
      ],
    },
    {
      question: 'Quiero hablar con una persona',
      answer:
        '¡Con gusto! Un asesor te atenderá en nuestro horario de atención:\n\n📞 +57 321 382 6385\n📞 +57 310 861 2970\n✉️ empaquesdesa@gmail.com',
      links: [
        WHATSAPP_1,
        WHATSAPP_2,
        { label: 'Enviar correo', url: 'mailto:empaquesdesa@gmail.com', icon: 'pi pi-envelope' },
      ],
    },
  ];

  selectQuestion(q: QuickQuestion) {
    if (this.typing()) return;

    this.messages.update((m) => [...m, { from: 'user', text: q.question, time: this.now() }]);
    this.typing.set(true);
    this.scrollToBottom();

    this.replyTimer = setTimeout(() => {
      this.typing.set(false);
      this.messages.update((m) => [
        ...m,
        { from: 'bot', text: q.answer, links: q.links, time: this.now() },
      ]);
      this.scrollToBottom();
    }, 700);
  }

  close() {
    clearTimeout(this.replyTimer);
    this.typing.set(false);
    this.messages.set(this.initialMessages());
    this.chat.close();
  }

  openLink(url: string) {
    window.open(url, url.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
  }

  private initialMessages(): Message[] {
    return [
      {
        from: 'bot',
        text: '¡Hola! 👋 Soy el asistente de Empaques Desa. ¿En qué te puedo ayudar?',
        time: this.now(),
      },
    ];
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.body?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 50);
  }

  private now(): string {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
}