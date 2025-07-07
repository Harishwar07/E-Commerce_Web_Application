import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="orders-page">
      <div class="container">
        <div class="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        <div class="orders-filters">
          <div class="filter-tabs">
            <button 
              *ngFor="let status of orderStatuses" 
              [class.active]="selectedStatus === status.value"
              (click)="filterByStatus(status.value)"
              class="filter-tab"
            >
              {{ status.label }}
              <span class="count" *ngIf="getOrderCountByStatus(status.value) > 0">
                {{ getOrderCountByStatus(status.value) }}
              </span>
            </button>
          </div>
          
          <div class="search-filter">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (keyup.enter)="searchOrders()"
              placeholder="Search orders..." 
              class="search-input"
            />
            <button (click)="searchOrders()" class="search-btn">🔍</button>
          </div>
        </div>

        <div class="orders-content" *ngIf="filteredOrders.length > 0; else noOrders">
          <div class="orders-list">
            <div *ngFor="let order of paginatedOrders" class="order-card">
              <div class="order-header">
                <div class="order-info">
                  <h3>Order #{{ order.id }}</h3>
                  <p class="order-date">Placed on {{ order.createdAt | date:'medium' }}</p>
                  <p class="order-total">Total: ₹{{ order.total | number:'1.0-0' }}</p>
                </div>
                <div class="order-status">
                  <span class="status-badge" [ngClass]="order.status">
                    {{ getStatusDisplay(order.status) }}
                  </span>
                  <div class="order-actions">
                    <button (click)="toggleOrderDetails(order.id)" class="details-btn">
                      {{ expandedOrders.has(order.id) ? 'Hide Details' : 'View Details' }}
                    </button>
                    <button 
                      *ngIf="order.status === 'pending'" 
                      (click)="cancelOrder(order.id)"
                      class="cancel-btn"
                    >
                      Cancel
                    </button>
                    <button 
                      *ngIf="order.status === 'delivered'" 
                      (click)="reorderItems(order)"
                      class="reorder-btn"
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              </div>

              <div class="order-progress" *ngIf="order.status !== 'cancelled'">
                <div class="progress-bar">
                  <div class="progress-step" [class.completed]="isStepCompleted(order.status, 'pending')">
                    <div class="step-icon">📝</div>
                    <span>Order Placed</span>
                  </div>
                  <div class="progress-step" [class.completed]="isStepCompleted(order.status, 'processing')">
                    <div class="step-icon">⚙️</div>
                    <span>Processing</span>
                  </div>
                  <div class="progress-step" [class.completed]="isStepCompleted(order.status, 'shipped')">
                    <div class="step-icon">🚚</div>
                    <span>Shipped</span>
                  </div>
                  <div class="progress-step" [class.completed]="isStepCompleted(order.status, 'delivered')">
                    <div class="step-icon">📦</div>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>

              <div class="order-details" *ngIf="expandedOrders.has(order.id)">
                <div class="order-items">
                  <h4>Order Items</h4>
                  <div class="items-list">
                    <div *ngFor="let item of order.items" class="order-item">
                      <img [src]="item.image" [alt]="item.productName" class="item-image" />
                      <div class="item-info">
                        <h5>{{ item.productName }}</h5>
                        <p class="item-details">Quantity: {{ item.quantity }}</p>
                        <p class="item-price">₹{{ item.price | number:'1.0-0' }} each</p>
                        <p class="item-total">Subtotal: ₹{{ (item.price * item.quantity) | number:'1.0-0' }}</p>
                      </div>
                      <div class="item-actions">
                        <button 
                          routerLink="/products/{{ item.productId }}" 
                          class="view-product-btn"
                        >
                          View Product
                        </button>
                        <button 
                          *ngIf="order.status === 'delivered'" 
                          (click)="writeReview(item)"
                          class="review-btn"
                        >
                          Write Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="order-summary">
                  <div class="summary-section">
                    <h4>Shipping Address</h4>
                    <div class="address-info">
                      <p>{{ order.shippingAddress.street }}</p>
                      <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}</p>
                      <p>{{ order.shippingAddress.country }}</p>
                    </div>
                  </div>

                  <div class="summary-section">
                    <h4>Payment Method</h4>
                    <p>{{ order.paymentMethod }}</p>
                  </div>

                  <div class="summary-section">
                    <h4>Order Summary</h4>
                    <div class="price-breakdown">
                      <div class="price-row">
                        <span>Subtotal:</span>
                        <span>₹{{ getOrderSubtotal(order) | number:'1.0-0' }}</span>
                      </div>
                      <div class="price-row">
                        <span>Shipping:</span>
                        <span>₹{{ getOrderShipping(order) | number:'1.0-0' }}</span>
                      </div>
                      <div class="price-row">
                        <span>Tax:</span>
                        <span>₹{{ getOrderTax(order) | number:'1.0-0' }}</span>
                      </div>
                      <div class="price-row total">
                        <span>Total:</span>
                        <span>₹{{ order.total | number:'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="summary-section" *ngIf="order.estimatedDelivery">
                    <h4>Delivery Information</h4>
                    <p *ngIf="order.status === 'shipped'">
                      <strong>Estimated Delivery:</strong> {{ order.estimatedDelivery | date:'fullDate' }}
                    </p>
                    <p *ngIf="order.status === 'delivered'">
                      <strong>Delivered on:</strong> {{ order.estimatedDelivery | date:'fullDate' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button 
              (click)="goToPage(currentPage - 1)" 
              [disabled]="currentPage === 1"
              class="pagination-btn"
            >
              Previous
            </button>
            
            <div class="page-numbers">
              <button 
                *ngFor="let page of getPageNumbers()" 
                (click)="goToPage(page)"
                [class.active]="page === currentPage"
                class="page-btn"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              (click)="goToPage(currentPage + 1)" 
              [disabled]="currentPage === totalPages"
              class="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>

        <ng-template #noOrders>
          <div class="no-orders">
            <div class="no-orders-icon">📦</div>
            <h3>No orders found</h3>
            <p *ngIf="selectedStatus === 'all'">You haven't placed any orders yet.</p>
            <p *ngIf="selectedStatus !== 'all'">No orders with status "{{ getStatusLabel(selectedStatus) }}".</p>
            <button routerLink="/products" class="shop-btn">Start Shopping</button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .orders-page {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .orders-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .orders-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .orders-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .orders-filters {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
    }

    .filter-tab {
      background: none;
      border: 2px solid #e0e0e0;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      color: #666;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-tab:hover {
      border-color: #1976D2;
      color: #1976D2;
    }

    .filter-tab.active {
      background: #1976D2;
      border-color: #1976D2;
      color: white;
    }

    .count {
      background: rgba(255,255,255,0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      min-width: 20px;
      text-align: center;
    }

    .filter-tab.active .count {
      background: rgba(255,255,255,0.3);
    }

    .search-filter {
      display: flex;
      gap: 0.5rem;
    }

    .search-input {
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      font-size: 1rem;
      min-width: 250px;
    }

    .search-input:focus {
      outline: none;
      border-color: #1976D2;
    }

    .search-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1rem;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s;
    }

    .order-card:hover {
      transform: translateY(-2px);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .order-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.3rem;
    }

    .order-date {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .order-total {
      margin: 0;
      color: #1976D2;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .order-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 1rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .order-actions {
      display: flex;
      gap: 0.5rem;
    }

    .details-btn,
    .cancel-btn,
    .reorder-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    .details-btn {
      background: #1976D2;
      color: white;
    }

    .details-btn:hover {
      background: #1565C0;
    }

    .cancel-btn {
      background: #f44336;
      color: white;
    }

    .cancel-btn:hover {
      background: #d32f2f;
    }

    .reorder-btn {
      background: #4caf50;
      color: white;
    }

    .reorder-btn:hover {
      background: #45a049;
    }

    .order-progress {
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .progress-bar {
      display: flex;
      justify-content: space-between;
      position: relative;
    }

    .progress-bar::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #e0e0e0;
      z-index: 1;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      z-index: 2;
      background: #f8f9fa;
      padding: 0 1rem;
    }

    .step-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.3s;
    }

    .progress-step.completed .step-icon {
      background: #4caf50;
      color: white;
    }

    .progress-step span {
      font-size: 0.8rem;
      color: #666;
      font-weight: 600;
      text-align: center;
    }

    .progress-step.completed span {
      color: #4caf50;
    }

    .order-details {
      padding: 1.5rem;
      border-top: 1px solid #f0f0f0;
    }

    .order-items h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .order-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
    }

    .item-info {
      flex: 1;
    }

    .item-info h5 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
    }

    .item-details {
      margin: 0 0 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .item-price {
      margin: 0 0 0.25rem 0;
      color: #1976D2;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .item-total {
      margin: 0;
      color: #333;
      font-weight: 600;
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .view-product-btn,
    .review-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #1976D2;
      background: none;
      color: #1976D2;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      text-decoration: none;
      text-align: center;
      transition: all 0.3s;
    }

    .view-product-btn:hover,
    .review-btn:hover {
      background: #1976D2;
      color: white;
    }

    .order-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .summary-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .address-info p {
      margin: 0 0 0.25rem 0;
      color: #666;
    }

    .price-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      color: #666;
    }

    .price-row.total {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
      padding-top: 0.5rem;
      border-top: 1px solid #e0e0e0;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .pagination-btn,
    .page-btn {
      background: white;
      border: 2px solid #e0e0e0;
      color: #666;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .pagination-btn:hover:not(:disabled),
    .page-btn:hover {
      border-color: #1976D2;
      color: #1976D2;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-btn.active {
      background: #1976D2;
      border-color: #1976D2;
      color: white;
    }

    .page-numbers {
      display: flex;
      gap: 0.5rem;
    }

    .no-orders {
      text-align: center;
      padding: 4rem 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .no-orders-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-orders h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .no-orders p {
      color: #666;
      margin-bottom: 2rem;
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
      text-decoration: none;
      display: inline-block;
    }

    .shop-btn:hover {
      background: #1565C0;
    }

    @media (max-width: 768px) {
      .orders-filters {
        flex-direction: column;
        gap: 1rem;
      }

      .filter-tabs {
        flex-wrap: wrap;
        justify-content: center;
      }

      .search-input {
        min-width: 200px;
      }

      .order-header {
        flex-direction: column;
        gap: 1rem;
      }

      .order-status {
        align-items: flex-start;
      }

      .order-actions {
        flex-wrap: wrap;
      }

      .progress-bar {
        flex-wrap: wrap;
        gap: 1rem;
      }

      .order-item {
        flex-direction: column;
        text-align: center;
      }

      .item-actions {
        flex-direction: row;
        justify-content: center;
      }

      .order-summary {
        grid-template-columns: 1fr;
      }

      .page-numbers {
        flex-wrap: wrap;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];
  expandedOrders = new Set<number>();
  
  selectedStatus = 'all';
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  orderStatuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // Load orders from localStorage (in real app, this would be from API)
    const savedOrders = localStorage.getItem('userOrders');
    if (savedOrders) {
      try {
        this.orders = JSON.parse(savedOrders);
      } catch (error) {
        console.error('Error parsing saved orders:', error);
        this.orders = [];
      }
    } else {
      this.orders = [];
    }

    this.filterOrders();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.filterOrders();
  }

  searchOrders(): void {
    this.currentPage = 1;
    this.filterOrders();
  }

  filterOrders(): void {
    let filtered = [...this.orders];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(query) ||
        order.items.some(item => item.productName.toLowerCase().includes(query))
      );
    }

    this.filteredOrders = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders.length;
    }
    return this.orders.filter(order => order.status === status).length;
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Order Placed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getStatusLabel(status: string): string {
    const statusObj = this.orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  toggleOrderDetails(orderId: number): void {
    if (this.expandedOrders.has(orderId)) {
      this.expandedOrders.delete(orderId);
    } else {
      this.expandedOrders.add(orderId);
    }
  }

  isStepCompleted(orderStatus: string, stepStatus: string): boolean {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const orderIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    return orderIndex >= stepIndex;
  }

  getOrderSubtotal(order: Order): number {
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getOrderShipping(order: Order): number {
    const subtotal = this.getOrderSubtotal(order);
    return subtotal > 4149 ? 0 : 495; // Free shipping above ₹4149
  }

  getOrderTax(order: Order): number {
    return this.getOrderSubtotal(order) * 0.18; // 18% GST
  }

  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      const orderIndex = this.orders.findIndex(order => order.id === orderId);
      if (orderIndex > -1) {
        this.orders[orderIndex].status = 'cancelled' as any;
        this.saveOrders();
        this.filterOrders();
      }
    }
  }

  reorderItems(order: Order): void {
    // In real app, this would add items back to cart
    console.log('Reordering items from order:', order.id);
    alert('Items have been added to your cart!');
  }

  writeReview(item: any): void {
    // In real app, this would navigate to review page
    console.log('Writing review for:', item.productName);
    alert('Review feature coming soon!');
  }

  private saveOrders(): void {
    localStorage.setItem('userOrders', JSON.stringify(this.orders));
  }
}