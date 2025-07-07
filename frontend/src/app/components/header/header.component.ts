import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <div class="logo">
            <a routerLink="/" class="logo-link">
              <h1>ShopZone</h1>
            </a>
          </div>

          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-bar">
              <input 
                type="text" 
                placeholder="Search products..." 
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                class="search-input"
              >
              <button (click)="onSearch()" class="search-button">
                <span class="search-icon">🔍</span>
              </button>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="nav">
            <a routerLink="/products" class="nav-link">Products</a>
            
            <!-- Wishlist -->
            <a routerLink="/wishlist" class="wishlist-link">
              <span class="wishlist-icon">🤍</span>
              <span class="wishlist-count" *ngIf="wishlistItemCount > 0">{{wishlistItemCount}}</span>
            </a>
            
            <!-- Cart -->
            <a routerLink="/cart" class="cart-link">
              <span class="cart-icon">🛒</span>
              <span class="cart-count" *ngIf="cartItemCount > 0">{{cartItemCount}}</span>
            </a>

            <!-- User Menu -->
            <div class="user-menu" *ngIf="currentUser$ | async as user; else loginButton">
              <div class="user-dropdown" [class.open]="isDropdownOpen">
                <button class="user-button" (click)="toggleDropdown($event)">
                  <span class="user-icon">👤</span>
                  <span class="user-name">{{user.name || user.email}}</span>
                  <span class="dropdown-arrow" [class.rotated]="isDropdownOpen">▼</span>
                </button>
                <div class="dropdown-content" *ngIf="isDropdownOpen">
                  <a routerLink="/profile" class="dropdown-item" (click)="closeDropdown()">
                    <span class="item-icon">👤</span>
                    Profile
                  </a>
                  <a routerLink="/orders" class="dropdown-item" (click)="closeDropdown()">
                    <span class="item-icon">📦</span>
                    My Orders
                  </a>
                  <a routerLink="/admin" class="dropdown-item" (click)="closeDropdown()">
                    <span class="item-icon">⚙️</span>
                    Admin
                  </a>
                  <div class="dropdown-divider"></div>
                  <button (click)="logout()" class="dropdown-item logout-btn">
                    <span class="item-icon">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <ng-template #loginButton>
              <div class="auth-buttons">
                <a routerLink="/login" class="nav-link">Login</a>
                <a routerLink="/register" class="register-btn">Sign Up</a>
              </div>
            </ng-template>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .logo h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: white;
    }

    .logo-link {
      text-decoration: none;
    }

    .search-container {
      flex: 1;
      max-width: 600px;
    }

    .search-bar {
      display: flex;
      border-radius: 25px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      outline: none;
      font-size: 1rem;
    }

    .search-button {
      background: #FF9800;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      transition: background 0.3s;
    }

    .search-button:hover {
      background: #F57C00;
    }

    .search-icon {
      font-size: 1.2rem;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-link:hover {
      color: #FFEB3B;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .register-btn {
      background: #FF9800;
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .register-btn:hover {
      background: #F57C00;
      transform: translateY(-1px);
    }

    .wishlist-link,
    .cart-link {
      position: relative;
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      transition: transform 0.3s;
    }

    .wishlist-link:hover,
    .cart-link:hover {
      transform: scale(1.1);
    }

    .wishlist-count,
    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #FF5722;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .user-dropdown {
      position: relative;
    }

    .user-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 25px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .user-button:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .user-dropdown.open .user-button {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .user-icon {
      font-size: 1.2rem;
    }

    .user-name {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-arrow {
      font-size: 0.8rem;
      transition: transform 0.3s ease;
    }

    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }

    .dropdown-content {
      position: absolute;
      right: 0;
      top: calc(100% + 0.5rem);
      background: white;
      min-width: 200px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-radius: 12px;
      overflow: hidden;
      z-index: 1000;
      animation: dropdownSlide 0.3s ease-out;
    }

    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-item {
      color: #333;
      padding: 0.75rem 1rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: background 0.3s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .dropdown-item:hover {
      background: #f8f9fa;
    }

    .item-icon {
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
    }

    .dropdown-divider {
      height: 1px;
      background: #eee;
      margin: 0.5rem 0;
    }

    .logout-btn {
      color: #d32f2f !important;
    }

    .logout-btn:hover {
      background: #ffebee !important;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .search-container {
        width: 100%;
        order: 3;
      }

      .nav {
        flex-wrap: wrap;
        justify-content: center;
        order: 2;
      }

      .logo {
        order: 1;
      }

      .logo h1 {
        font-size: 1.5rem;
      }

      .user-name {
        display: none;
      }

      .dropdown-content {
        right: -50px;
        min-width: 160px;
      }
    }

    @media (max-width: 480px) {
      .nav {
        gap: 1rem;
      }

      .user-button {
        padding: 0.5rem;
      }

      .dropdown-content {
        right: -20px;
        min-width: 140px;
      }

      .dropdown-item {
        padding: 0.6rem 0.8rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  searchQuery: string = '';
  cartItemCount: number = 0;
  wishlistItemCount: number = 0;
  isDropdownOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productService: ProductService
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.cartService.cart.subscribe(cart => {
      this.cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    });

    this.wishlistService.wishlist.subscribe(wishlist => {
      this.wishlistItemCount = wishlist.length;
    });
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdown when clicking outside
    this.isDropdownOpen = false;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Navigate to search results page
      // You can implement router navigation here
      console.log('Searching for:', this.searchQuery);
    }
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }
}