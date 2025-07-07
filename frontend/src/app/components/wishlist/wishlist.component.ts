import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wishlist-page">
      <div class="container">
        <div class="wishlist-header">
          <h2>My Wishlist</h2>
          <span class="item-count">{{ wishlistItems.length }} items</span>
        </div>

        <div class="wishlist-content" *ngIf="wishlistItems.length > 0; else emptyWishlist">
          <div class="wishlist-grid">
            <div *ngFor="let item of wishlistItems" class="wishlist-item">
              <div class="item-image">
                <img [src]="item.image" [alt]="item.name" />
              </div>
              
              <div class="item-details">
                <h3>{{ item.name }}</h3>
                <p class="item-brand">{{ item.brand }}</p>
                <p class="item-price">₹{{ item.price | number:'1.0-0' }}</p>
                <p class="item-category">{{ item.category }}</p>
                
                <div class="item-actions">
                  <button 
                    (click)="addToCart(item)" 
                    class="add-to-cart-btn"
                    [disabled]="item.stock === 0"
                  >
                    <span *ngIf="item.stock > 0">Add to Cart</span>
                    <span *ngIf="item.stock === 0">Out of Stock</span>
                  </button>
                  
                  <button (click)="removeFromWishlist(item.id)" class="remove-btn">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="wishlist-actions">
            <button (click)="clearWishlist()" class="clear-btn">
              Clear Wishlist
            </button>
            <button routerLink="/products" class="continue-shopping">
              Continue Shopping
            </button>
          </div>
        </div>

        <ng-template #emptyWishlist>
          <div class="empty-wishlist">
            <div class="empty-wishlist-icon">🤍</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love for later</p>
            <button routerLink="/products" class="shop-now-btn">
              Start Shopping
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .wishlist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .wishlist-header h2 {
      margin: 0;
      color: #333;
    }

    .item-count {
      color: #666;
      font-size: 1.1rem;
    }

    .wishlist-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .wishlist-item {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      border: 1px solid #eee;
      border-radius: 12px;
      transition: transform 0.3s ease;
    }

    .wishlist-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .item-image img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
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
      font-size: 1.2rem;
      margin: 0 0 0.5rem 0;
    }

    .item-category {
      color: #999;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 1rem 0;
    }

    .item-actions {
      display: flex;
      gap: 1rem;
      margin-top: auto;
    }

    .add-to-cart-btn {
      flex: 1;
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: #1565C0;
    }

    .add-to-cart-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #d32f2f;
      cursor: pointer;
      font-size: 0.9rem;
      text-decoration: underline;
      padding: 0.75rem 1rem;
    }

    .remove-btn:hover {
      color: #b71c1c;
    }

    .wishlist-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }

    .clear-btn {
      background: #f44336;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .clear-btn:hover {
      background: #d32f2f;
    }

    .continue-shopping {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
    }

    .continue-shopping:hover {
      background: #1565C0;
    }

    .empty-wishlist {
      text-align: center;
      padding: 4rem 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .empty-wishlist-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-wishlist h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .empty-wishlist p {
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
      .wishlist-grid {
        grid-template-columns: 1fr;
      }

      .wishlist-item {
        flex-direction: column;
        text-align: center;
      }

      .item-image img {
        width: 100px;
        height: 100px;
        margin: 0 auto;
      }

      .wishlist-actions {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class WishlistComponent implements OnInit {
  wishlistItems: Product[] = [];

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.wishlistService.wishlist.subscribe(items => {
      this.wishlistItems = items;
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1).subscribe({
      next: () => {
        // Optionally remove from wishlist after adding to cart
        // this.removeFromWishlist(product.id);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
      }
    });
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId).subscribe();
  }

  clearWishlist(): void {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      this.wishlistService.clearWishlist().subscribe();
    }
  }
}