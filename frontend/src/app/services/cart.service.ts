import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CartItem, Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = 'http://localhost:3000/api/cart';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart = this.cartSubject.asObservable();

  // Mock cart for when backend is not available
  private mockCart: CartItem[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.loadCart();
  }

  public get cartValue(): CartItem[] {
    return this.cartSubject.value;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  addToCart(product: Product, quantity: number = 1): Observable<any> {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      // Add to local cart for non-logged in users
      return this.addToLocalCart(product, quantity);
    }

    const cartItem = { product_id: product.id, quantity };
    
    return this.http.post<any>(`${this.baseUrl}/add`, cartItem, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          this.notificationService.addNotification({
            type: 'success',
            title: 'Added to Cart',
            message: `${product.name} has been added to your cart`
          });
          this.loadCart();
          return response;
        }),
        catchError(error => {
          console.error('Error adding to cart, using local storage:', error);
          return this.addToLocalCart(product, quantity);
        })
      );
  }

  private addToLocalCart(product: Product, quantity: number): Observable<any> {
    const existingItemIndex = this.mockCart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex > -1) {
      this.mockCart[existingItemIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: Date.now(), // Simple ID generation
        product: product,
        quantity: quantity
      };
      this.mockCart.push(newItem);
    }
    
    this.cartSubject.next([...this.mockCart]);
    this.saveToLocalStorage();
    
    this.notificationService.addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart`
    });
    
    return of({ message: 'Added to local cart' });
  }

  updateQuantity(itemId: number, quantity: number): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return this.updateLocalQuantity(itemId, quantity);
    }

    return this.http.put<any>(`${this.baseUrl}/update/${itemId}`, { quantity }, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          this.loadCart();
          return response;
        }),
        catchError(error => {
          console.error('Error updating quantity, using local storage:', error);
          return this.updateLocalQuantity(itemId, quantity);
        })
      );
  }

  private updateLocalQuantity(itemId: number, quantity: number): Observable<any> {
    const itemIndex = this.mockCart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      if (quantity > 0) {
        this.mockCart[itemIndex].quantity = quantity;
      } else {
        this.mockCart.splice(itemIndex, 1);
      }
      this.cartSubject.next([...this.mockCart]);
      this.saveToLocalStorage();
    }
    return of({ message: 'Updated local cart' });
  }

  removeFromCart(itemId: number): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return this.removeFromLocalCart(itemId);
    }

    return this.http.delete<any>(`${this.baseUrl}/remove/${itemId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          this.notificationService.addNotification({
            type: 'success',
            title: 'Removed from Cart',
            message: 'Item has been removed from your cart'
          });
          this.loadCart();
          return response;
        }),
        catchError(error => {
          console.error('Error removing from cart, using local storage:', error);
          return this.removeFromLocalCart(itemId);
        })
      );
  }

  private removeFromLocalCart(itemId: number): Observable<any> {
    const itemIndex = this.mockCart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      this.mockCart.splice(itemIndex, 1);
      this.cartSubject.next([...this.mockCart]);
      this.saveToLocalStorage();
      
      this.notificationService.addNotification({
        type: 'success',
        title: 'Removed from Cart',
        message: 'Item has been removed from your cart'
      });
    }
    return of({ message: 'Removed from local cart' });
  }

  getCart(): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return of({ cart_items: this.mockCart, total: this.getCartTotal(), item_count: this.mockCart.length });
    }

    return this.http.get<any>(`${this.baseUrl}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error loading cart from server, using local storage:', error);
          return of({ cart_items: this.mockCart, total: this.getCartTotal(), item_count: this.mockCart.length });
        })
      );
  }

  clearCart(): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      this.mockCart = [];
      this.cartSubject.next([]);
      this.saveToLocalStorage();
      return of({ message: 'Local cart cleared' });
    }

    return this.http.delete<any>(`${this.baseUrl}/clear`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          this.cartSubject.next([]);
          return response;
        }),
        catchError(error => {
          console.error('Error clearing cart, using local storage:', error);
          this.mockCart = [];
          this.cartSubject.next([]);
          this.saveToLocalStorage();
          return of({ message: 'Local cart cleared' });
        })
      );
  }

  private loadCart(): void {
    this.loadFromLocalStorage();
    
    if (this.authService.isLoggedIn()) {
      this.getCart().subscribe(cart => {
        this.cartSubject.next(cart.cart_items || []);
      });
    } else {
      this.cartSubject.next([...this.mockCart]);
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.mockCart));
  }

  private loadFromLocalStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        this.mockCart = JSON.parse(savedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        this.mockCart = [];
      }
    }
  }

  getCartTotal(): number {
    return this.cartValue.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cartValue.reduce((count, item) => count + item.quantity, 0);
  }
}