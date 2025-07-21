import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userName: string | null = null;
  userRole: string | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    console.log('currentUser', currentUser);
    
    this.userName = currentUser?.name || null;    
    this.userRole = currentUser?.role || null;
  }
}
