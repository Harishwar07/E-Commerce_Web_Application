import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-page">
      <div class="container">
        <div class="cart-header">
          <h2>Shopping Cart</h2>
          <span class="item-count">{{ cartItems.length }} items</span>
        </div>

        <div class="cart-content" *ngIf="cartItems.length > 0; else emptyCart">
          <div class="cart-items">
            <div *ngFor="let item of cartItems" class="cart-item">
              <div class="item-image">
                <img [src]="item.product.image" [alt]="item.product.name" />
              </div>
              
              <div class="item-details">
                <h3>{{ item.product.name }}</h3>
                <p class="item-brand">{{ item.product.brand }}</p>
                <p class="item-price">₹{{ item.product.price | number:'1.0-0' }}</p>
                
                <div class="item-actions">
                  <div class="quantity-controls">
                    <button (click)="updateQuantity(item, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button (click)="updateQuantity(item, item.quantity + 1)">+</button>
                  </div>
                  
                  <button (click)="removeItem(item)" class="remove-btn">
                    Remove
                  </button>
                </div>
              </div>
              
              <div class="item-total">
                <span class="total-price">₹{{ (item.product.price * item.quantity) | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-card">
              <h3>Order Summary</h3>
              
              <div class="summary-row">
                <span>Subtotal ({{ getTotalItems() }} items)</span>
                <span>₹{{ getSubtotal() | number:'1.0-0' }}</span>
              </div>
              
              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ getSubtotal() > 4149 ? 'FREE' : '₹495' }}</span>
              </div>
              
              <div class="summary-row">
                <span>Tax (GST 18%)</span>
                <span>₹{{ getTax() | number:'1.0-0' }}</span>
              </div>
              
              <hr>
              
              <div class="summary-row total">
                <span>Total</span>
                <span>₹{{ getTotal() | number:'1.0-0' }}</span>
              </div>
              
              <button 
                routerLink="/checkout" 
                class="checkout-btn"
                [disabled]="!isLoggedIn()"
              >
                <span *ngIf="isLoggedIn()">🛒 Proceed to Checkout</span>
                <span *ngIf="!isLoggedIn()">Please Login to Checkout</span>
              </button>
              
              <button 
                *ngIf="!isLoggedIn()" 
                routerLink="/login" 
                class="login-btn"
              >
                Login to Continue
              </button>
              
              <button routerLink="/products" class="continue-shopping">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        <ng-template #emptyCart>
          <div class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started</p>
            <button routerLink="/products" class="shop-now-btn">
              Start Shopping
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .cart-header h2 {
      margin: 0;
      color: #333;
    }

    .item-count {
      color: #666;
      font-size: 1.1rem;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .cart-items {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 120px 1fr auto;
      gap: 1.5rem;
      padding: 1.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-image img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .item-brand {
      color: #666;
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }

    .item-price {
      color: #1976D2;
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0 0 1rem 0;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0.25rem;
    }

    .quantity-controls button {
      background: none;
      border: none;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quantity-controls button:hover:not(:disabled) {
      background: #f5f5f5;
    }

    .quantity-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      min-width: 40px;
      text-align: center;
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #d32f2f;
      cursor: pointer;
      font-size: 0.9rem;
      text-decoration: underline;
    }

    .remove-btn:hover {
      color: #b71c1c;
    }

    .item-total {
      display: flex;
      align-items: center;
    }

    .total-price {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }

    .cart-summary {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      height: fit-content;
    }

    .summary-card h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      color: #666;
    }

    .summary-row.total {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }

    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 1.5rem 0;
    }

    .checkout-btn {
      width: 100%;
      background: #1976D2;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 1rem;
      transition: background 0.3s;
    }

    .checkout-btn:hover:not(:disabled) {
      background: #1565C0;
    }

    .checkout-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .login-btn {
      width: 100%;
      background: #FF9800;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 1rem;
      transition: background 0.3s;
      text-decoration: none;
      display: block;
      text-align: center;
    }

    .login-btn:hover {
      background: #F57C00;
    }

    .continue-shopping {
      width: 100%;
      background: none;
      color: #1976D2;
      border: 2px solid #1976D2;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: block;
      text-align: center;
    }

    .continue-shopping:hover {
      background: #1976D2;
      color: white;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .empty-cart-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-cart h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .empty-cart p {
      color: #666;
      margin-bottom: 2rem;
    }

    .shop-now-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .shop-now-btn:hover {
      background: #1565C0;
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 1rem;
      }

      .item-total {
        grid-column: 1 / -1;
        justify-content: flex-end;
        margin-top: 1rem;
      }

      .item-image img {
        width: 80px;
        height: 80px;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.cart.subscribe(items => {
      this.cartItems = items;
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getShipping(): number {
    return this.getSubtotal() > 4149 ? 0 : 495; // Free shipping above ₹4149
  }

  getTax(): number {
    return this.getSubtotal() * 0.18; // 18% GST
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}