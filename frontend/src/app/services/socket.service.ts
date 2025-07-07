import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  public isConnected = this.connected.asObservable();

  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private connect(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io('http://localhost:4000', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected.next(false);
    });

    this.socket.on('connect_error', (error:any) => {
      console.error('Connection error:', error);
      this.connected.next(false);
    });
  }

  private disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected.next(false);
    }
  }

  // Listen for stock updates
  onStockUpdate(): Observable<{productId: number, newStock: number}> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('stock_updated', (data:any) => {
          observer.next(data);
        });
      }
    });
  }

  // Listen for order updates
  onOrderUpdate(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('order_updated', (data:any) => {
          observer.next(data);
        });
      }
    });
  }

  // Listen for new orders (admin)
  onNewOrder(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('new_order', (data:any) => {
          observer.next(data);
        });
      }
    });
  }

  // Listen for product updates
  onProductUpdate(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('product_updated', (data:any) => {
          observer.next(data);
        });
      }
    });
  }

  // Emit events
  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}