import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { CommonModule } from '@angular/common';
import { RoleAccessDirective } from '../../../shared/role-access.directive';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RoleAccessDirective, FormsModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  orders: any[] = [];
  statusOptions = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

  constructor(private orderService: OrderService, public authService: AuthService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
    });
  }

  updateStatus(order: any, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe(() => {
      order.status = newStatus; // Update local state
    });
  }
}
