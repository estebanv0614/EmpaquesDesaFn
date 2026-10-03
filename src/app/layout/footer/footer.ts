import { Component, inject } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { ChatWidgetService } from '../../shared/services/chat-widget';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  chatService = inject(ChatWidgetService);

  constructor(
    public router: Router
  ) {}
}