import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-thanks',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './thanks.html',
  styleUrls: ['./thanks.scss']
})
export class Thanks {}
