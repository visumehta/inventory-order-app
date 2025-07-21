import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductResponse } from '../../shared/interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/inventory';

  constructor(private http: HttpClient) { }

  getProducts(page: number, limit: number, sort: string, order: string, filter: string): Observable<ProductResponse> {
    let params = new HttpParams();
    params = params.append('_page', page.toString());
    params = params.append('_limit', limit.toString());
    params = params.append('_sort', sort);
    params = params.append('_order', order);
    if (filter) {
      params = params.append('q', filter);
    }
    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  addProduct(formData: FormData): Observable<Product> {
    console.log('formData', formData);
    return this.http.post<Product>(this.apiUrl, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: number): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/${id}`);
  }

  checkSkuExists(master_sku: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/validate-sku/${master_sku}`);
  }
}
