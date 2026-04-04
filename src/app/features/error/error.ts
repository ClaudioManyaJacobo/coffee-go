import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.html',
  styleUrls: ['./error.scss']
})
export class ErrorComponent {
  constructor(private router: Router) {}

  retry() {
    this.router.navigate(['/home']);
  }
}
