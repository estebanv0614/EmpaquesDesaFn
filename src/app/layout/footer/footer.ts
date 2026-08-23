import { Component } from '@angular/core';
import { RouterLink, Router } from "@angular/router";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(
    public router: Router
  ) {}
}
