import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-dashboard">
      <div class="container">
        <div class="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your e-commerce platform</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>Total Sales</h3>
              <p class="stat-value">₹{{ totalSales | number:'1.0-0' }}</p>
              <span class="stat-change positive">+12.5%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <h3>Total Orders</h3>
              <p class="stat-value">{{ totalOrders }}</p>
              <span class="stat-change positive">+8.3%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>Total Users</h3>
              <p class="stat-value">{{ totalUsers }}</p>
              <span class="stat-change positive">+15.2%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🛍️</div>
            <div class="stat-content">
              <h3>Total Products</h3>
              <p class="stat-value">{{ totalProducts }}</p>
              <span class="stat-change neutral">+2.1%</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button routerLink="/admin/products" class="action-btn">
              <span class="action-icon">📦</span>
              <span>Manage Products</span>
            </button>
            
            <button routerLink="/admin/orders" class="action-btn">
              <span class="action-icon">📋</span>
              <span>View Orders</span>
            </button>
            
            <button routerLink="/admin/users" class="action-btn">
              <span class="action-icon">👥</span>
              <span>Manage Users</span>
            </button>
            
            <button routerLink="/admin/categories" class="action-btn">
              <span class="action-icon">🏷️</span>
              <span>Categories</span>
            </button>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="recent-section">
          <h2>Recent Orders</h2>
          <div class="table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of recentOrders">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.customerName }}</td>
                  <td>₹{{ order.amount | number:'1.0-0' }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="order.status">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>{{ order.date | date:'short' }}</td>
                  <td>
                    <button class="view-btn">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .dashboard-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .stat-icon {
      font-size: 2.5rem;
      background: #f0f7ff;
      padding: 1rem;
      border-radius: 12px;
    }

    .stat-content h3 {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .stat-change {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .stat-change.positive {
      color: #4caf50;
    }

    .stat-change.negative {
      color: #f44336;
    }

    .stat-change.neutral {
      color: #ff9800;
    }

    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-bottom: 3rem;
    }

    .quick-actions h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      background: #1976D2;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .action-btn:hover {
      background: #1565C0;
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 2rem;
    }

    .recent-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .recent-section h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .table-container {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th,
    .orders-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .orders-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
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

    .view-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .view-btn:hover {
      background: #1565C0;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .stat-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalSales: number = 10375230.50;
  totalOrders: number = 1247;
  totalUsers: number = 3456;
  totalProducts: number = 234;

  recentOrders = [
    {
      id: 1001,
      customerName: 'John Doe',
      amount: 10749.99,
      status: 'pending',
      date: new Date('2024-01-15')
    },
    {
      id: 1002,
      customerName: 'Jane Smith',
      amount: 7399.50,
      status: 'processing',
      date: new Date('2024-01-14')
    },
    {
      id: 1003,
      customerName: 'Mike Johnson',
      amount: 16549.99,
      status: 'shipped',
      date: new Date('2024-01-13')
    },
    {
      id: 1004,
      customerName: 'Sarah Wilson',
      amount: 6219.25,
      status: 'delivered',
      date: new Date('2024-01-12')
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Load dashboard data
  }
}