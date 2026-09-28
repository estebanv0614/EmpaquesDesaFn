import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [],
  templateUrl: './videos.html',
  styleUrl: './videos.css',
})
export class Videos implements AfterViewInit {
  @ViewChild('video1') video1!: ElementRef<HTMLVideoElement>;
  @ViewChild('video2') video2!: ElementRef<HTMLVideoElement>;

  constructor(public router: Router) {}

  irASolicitarCotizacion(): void {
    this.router.navigate(['/solicitud-nueva']);
  }

  ngAfterViewInit(): void {
    this.video1.nativeElement.muted = true;
    this.video2.nativeElement.muted = true;
  }
}
