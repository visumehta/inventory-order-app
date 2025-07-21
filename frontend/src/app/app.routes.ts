import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { OrderListComponent } from './features/orders/order-list/order-list.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { OrderDetailsComponent } from './features/orders/order-details/order-details.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
  { path: 'products/add', component: ProductFormComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  { path: 'orders', component: OrderListComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];
