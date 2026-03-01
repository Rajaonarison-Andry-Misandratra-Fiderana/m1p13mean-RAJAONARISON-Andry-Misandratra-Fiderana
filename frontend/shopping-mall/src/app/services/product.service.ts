import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) { }

  getProducts(filters?: {
    category?: string;
    shop?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.shop) params = params.set('shop', filters.shop);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductsByShop(shopId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/shop/${shopId}`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, request);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  addReview(productId: string, review: { comment: string; rating: number }): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${productId}/reviews`, review);
  }
}
