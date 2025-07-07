import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-card">
      <div class="product-image">
        <a [routerLink]="['/products', product.id]">
          <img [src]="product.image" [alt]="product.name" />
        </a>
        <div class="product-badge" *ngIf="product.rating >= 4.5">
          <span>⭐ Best Seller</span>
        </div>
        <button 
          class="wishlist-btn-overlay" 
          (click)="toggleWishlist()"
          [class.active]="isInWishlist"
        >
          <span>{{ isInWishlist ? '❤️' : '🤍' }}</span>
        </button>
      </div>
      
      <div class="product-info">
        <h3 class="product-name">
          <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
        </h3>
        
        <div class="product-rating">
          <div class="stars">
            <span *ngFor="let star of getStars(product.rating)" class="star">⭐</span>
          </div>
          <span class="rating-text">({{ product.rating }}) • {{ product.reviews.length }} reviews</span>
        </div>
        
        <div class="product-price">
          <span class="price">₹{{ product.price | number:'1.0-0' }}</span>
          <span class="original-price" *ngIf="product.price < 8300">₹{{ (product.price * 1.2) | number:'1.0-0' }}</span>
        </div>
        
        <div class="product-details">
          <p class="brand">{{ product.brand }}</p>
          <p class="category">{{ product.category }}</p>
        </div>
        
        <div class="product-actions">
          <button 
            (click)="addToCart()" 
            class="add-to-cart-btn"
            [disabled]="product.stock === 0 || isAddingToCart"
          >
            <span *ngIf="!isAddingToCart && product.stock > 0">Add to Cart</span>
            <span *ngIf="isAddingToCart">Adding...</span>
            <span *ngIf="product.stock === 0">Out of Stock</span>
          </button>
          
          <button 
            class="wishlist-btn"
            (click)="toggleWishlist()"
            [class.active]="isInWishlist"
          >
            <span>{{ isInWishlist ? '❤️' : '🤍' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 250px;
      overflow: hidden;
    }

    .product-image a {
      display: block;
      width: 100%;
      height: 100%;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #FF9800;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      z-index: 2;
    }

    .wishlist-btn-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      z-index: 2;
    }

    .wishlist-btn-overlay:hover {
      background: white;
      transform: scale(1.1);
    }

    .wishlist-btn-overlay.active {
      background: #FFE0E6;
    }

    .product-info {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-name {
      margin: 0 0 0.75rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .product-name a {
      color: #333;
      text-decoration: none;
      transition: color 0.3s;
    }

    .product-name a:hover {
      color: #1976D2;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .stars {
      display: flex;
      gap: 0.1rem;
    }

    .star {
      font-size: 0.9rem;
    }

    .rating-text {
      font-size: 0.85rem;
      color: #666;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1976D2;
    }

    .original-price {
      font-size: 1rem;
      color: #999;
      text-decoration: line-through;
    }

    .product-details {
      margin-bottom: 1rem;
    }

    .brand {
      font-size: 0.9rem;
      color: #666;
      margin: 0 0 0.25rem 0;
    }

    .category {
      font-size: 0.8rem;
      color: #999;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-actions {
      display: flex;
      gap: 0.75rem;
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
      transition: all 0.3s ease;
      position: relative;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: #1565C0;
      transform: translateY(-2px);
    }

    .add-to-cart-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .wishlist-btn {
      background: none;
      border: 2px solid #ddd;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .wishlist-btn:hover {
      border-color: #FF5722;
      background: #FFF3E0;
    }

    .wishlist-btn.active {
      border-color: #FF5722;
      background: #FFE0E6;
    }

    @media (max-width: 768px) {
      .product-image {
        height: 200px;
      }
      
      .product-info {
        padding: 1rem;
      }
      
      .product-name {
        font-size: 1rem;
      }
      
      .price {
        font-size: 1.3rem;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  isAddingToCart = false;
  isInWishlist = false;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.isInWishlist = this.wishlistService.isInWishlist(this.product.id);
    
    // Subscribe to wishlist changes
    this.wishlistService.wishlist.subscribe(() => {
      this.isInWishlist = this.wishlistService.isInWishlist(this.product.id);
    });
  }

  getStars(rating: number): number[] {
    return new Array(Math.floor(rating)).fill(0);
  }

  addToCart(): void {
    if (this.product.stock === 0 || this.isAddingToCart) return;
    
    this.isAddingToCart = true;
    
    this.cartService.addToCart(this.product, 1).subscribe({
      next: () => {
        this.isAddingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.isAddingToCart = false;
      }
    });
  }

  toggleWishlist(): void {
    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe();
    } else {
      this.wishlistService.addToWishlist(this.product).subscribe();
    }
  }
}