import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  chatService = inject(ChatService);

  constructor(public router: Router) {}
}