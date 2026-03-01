import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest, UpdateOrderStatusRequest, UpdatePaymentStatusRequest } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient) { }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my-orders`);
  }

  getShopOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/shop/orders`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, request);
  }

  updatePaymentStatus(id: string, request: UpdatePaymentStatusRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/payment-status`, request);
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
