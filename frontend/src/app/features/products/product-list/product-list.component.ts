import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';
import { StatusColorPipe } from '../../../shared/status-color.pipe';
import { RoleAccessDirective } from '../../../shared/role-access.directive';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { FormsModule } from '@angular/forms';
import { Product, ProductResponse } from '../../../shared/interfaces/product.interface';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, StatusColorPipe, RoleAccessDirective, RouterLink, ModalComponent, ProductFormComponent, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  filterText = '';

  showProductModal = false;
  selectedProduct: Product | null = null;

  // Make Math available in the template
  Math = Math;

  backendBaseUrl = 'http://localhost:3000'; // Assuming your backend runs on this URL
  isAdmin: boolean = false; // Add this property

  constructor(private productService: ProductService, private orderService: OrderService, private authService: AuthService) { }

  getFullImageUrl(relativePath: string | null | undefined): string {
    if (!relativePath) {
      return ''; // Or a placeholder image URL
    }
    return `${this.backendBaseUrl}${relativePath}`;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.isAdmin = this.authService.getUserRole() === 'admin'; // Set isAdmin based on user role
  }

  loadProducts(): void {
    this.productService.getProducts(
      this.currentPage,
      this.itemsPerPage,
      this.sortBy,
      this.sortOrder,
      this.filterText
    ).subscribe((response: ProductResponse) => {
      this.products = response.products;
      this.totalItems = response.total;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onSort(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'asc';
    }
    this.loadProducts();
  }

  onFilter(): void {
    this.currentPage = 1; // Reset to first page on filter change
    this.loadProducts();
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  getProductStatus(quantity: number): string {
    if (quantity > 10) {
      return 'Available';
    } else if (quantity > 0) {
      return 'Low';
    } else {
      return 'Out of Stock';
    }
  }

  openEditModal(product: Product): void {
    this.selectedProduct = { ...product }; // Create a copy to avoid direct mutation
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
    this.loadProducts(); // Reload products after modal closes
  }

  onProductFormSubmit(): void {
    this.closeProductModal();
  }

  placeOrder(product: Product): void {
    const currentUser = this.authService.currentUserValue;
    console.log('current user', currentUser)
    if (!currentUser || !currentUser.id) {
      alert('You must be logged in to place an order.');
      return;
    }

    const order = {
      user_id: currentUser.id,
      product_id: product.id,
      order_number: `ORD-${Date.now()}`,
      status: 'Pending'
    };

    this.orderService.createOrder(order).subscribe({
      next: (res) => {
        alert('Order placed successfully!');
        this.loadProducts(); // Reload products to reflect quantity change
      },
      error: (err) => {
        alert(`Error placing order: ${err.error.message || err.message}`);
      }
    });
  }
}
