import { Component } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { Auth } from '../../core/services/auth';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    public auth: Auth,
    public router: Router
  ) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/home'])
  }
}
