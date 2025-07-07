import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="container">
        <div class="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information and orders</p>
        </div>

        <div class="profile-content">
          <!-- Profile Information -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Personal Information</h2>
              <button (click)="toggleEdit()" class="edit-btn">
                {{ isEditing ? 'Cancel' : 'Edit' }}
              </button>
            </div>

            <form (ngSubmit)="saveProfile()" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="userProfile.firstName" 
                    name="firstName"
                    [readonly]="!isEditing"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="userProfile.lastName" 
                    name="lastName"
                    [readonly]="!isEditing"
                    class="form-control"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  [(ngModel)]="userProfile.email" 
                  name="email"
                  readonly
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  [(ngModel)]="userProfile.phone" 
                  name="phone"
                  [readonly]="!isEditing"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Address</label>
                <textarea 
                  [(ngModel)]="userProfile.address" 
                  name="address"
                  [readonly]="!isEditing"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <button 
                type="submit" 
                *ngIf="isEditing" 
                class="save-btn"
                [disabled]="saving"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </form>
          </div>

          <!-- Order History -->
          <div class="orders-section">
            <h2>Order History</h2>
            
            <div class="orders-list" *ngIf="orders.length > 0; else noOrders">
              <div *ngFor="let order of orders" class="order-card">
                <div class="order-header">
                  <div class="order-info">
                    <h3>Order #{{ order.id }}</h3>
                    <p class="order-date">{{ order.createdAt | date:'medium' }}</p>
                  </div>
                  <div class="order-status">
                    <span class="status-badge" [ngClass]="order.status">
                      {{ order.status | titlecase }}
                    </span>
                  </div>
                </div>

                <div class="order-items">
                  <div *ngFor="let item of order.items" class="order-item">
                    <img [src]="item.image" [alt]="item.productName" class="item-image" />
                    <div class="item-details">
                      <h4>{{ item.productName }}</h4>
                      <p>Quantity: {{ item.quantity }}</p>
                      <p class="item-price">\${{ item.price }}</p>
                    </div>
                  </div>
                </div>

                <div class="order-footer">
                  <div class="order-total">
                    <strong>Total: \${{ order.total }}</strong>
                  </div>
                  <div class="order-actions">
                    <button class="view-order-btn">View Details</button>
                    <button *ngIf="order.status === 'pending'" class="cancel-order-btn">
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ng-template #noOrders>
              <div class="no-orders">
                <p>You haven't placed any orders yet.</p>
                <button routerLink="/products" class="shop-btn">Start Shopping</button>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .profile-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .profile-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .profile-content {
      display: grid;
      gap: 2rem;
    }

    .profile-section,
    .orders-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      color: #333;
    }

    .edit-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .edit-btn:hover {
      background: #1565C0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 600;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #1976D2;
    }

    .form-control[readonly] {
      background: #f8f9fa;
      color: #666;
    }

    .save-btn {
      background: #4caf50;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .save-btn:hover:not(:disabled) {
      background: #45a049;
    }

    .save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .orders-section h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .order-card {
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
    }

    .order-info h3 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .order-date {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.processing {
      background: #cce5ff;
      color: #004085;
    }

    .status-badge.shipped {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.delivered {
      background: #d1ecf1;
      color: #0c5460;
    }

    .order-items {
      padding: 1rem;
    }

    .order-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .order-item:last-child {
      margin-bottom: 0;
    }

    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
    }

    .item-details h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-size: 1rem;
    }

    .item-details p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .item-price {
      color: #1976D2 !important;
      font-weight: 600 !important;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #eee;
    }

    .order-total {
      font-size: 1.1rem;
      color: #333;
    }

    .order-actions {
      display: flex;
      gap: 0.5rem;
    }

    .view-order-btn,
    .cancel-order-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .view-order-btn {
      background: #1976D2;
      color: white;
    }

    .view-order-btn:hover {
      background: #1565C0;
    }

    .cancel-order-btn {
      background: #f44336;
      color: white;
    }

    .cancel-order-btn:hover {
      background: #d32f2f;
    }

    .no-orders {
      text-align: center;
      padding: 2rem 0;
      color: #666;
    }

    .shop-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
    }

    .shop-btn:hover {
      background: #1565C0;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .order-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  userProfile: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  };
  
  orders: Order[] = [];
  isEditing: boolean = false;
  saving: boolean = false;

  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadOrders();
  }

  loadUserProfile(): void {
    // Mock user data - replace with actual API call
    this.userProfile = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Anytown, ST 12345'
    };
  }

  loadOrders(): void {
    // Mock orders data - replace with actual API call
    this.orders = [
      {
        id: 1001,
        userId: 1,
        items: [
          {
            id: 1,
            productId: 1,
            productName: 'Wireless Headphones',
            price: 99.99,
            quantity: 1,
            image: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=300'
          }
        ],
        total: 99.99,
        status: 'delivered' as any,
        shippingAddress: {} as any,
        paymentMethod: 'credit_card',
        createdAt: new Date('2024-01-10'),
        estimatedDelivery: new Date('2024-01-15')
      },
      {
        id: 1002,
        userId: 1,
        items: [
          {
            id: 2,
            productId: 2,
            productName: 'Smart Watch',
            price: 299.99,
            quantity: 1,
            image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=300'
          }
        ],
        total: 299.99,
        status: 'shipped' as any,
        shippingAddress: {} as any,
        paymentMethod: 'credit_card',
        createdAt: new Date('2024-01-12'),
        estimatedDelivery: new Date('2024-01-18')
      }
    ];
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    this.saving = true;
    
    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      this.isEditing = false;
      console.log('Profile saved:', this.userProfile);
    }, 1000);
  }
}