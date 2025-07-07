import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div class="notification-item" 
           *ngFor="let notification of notifications" 
           [ngClass]="notification.type"
           (click)="markAsRead(notification.id)">
        <div class="notification-header">
          <span class="notification-icon">
            <span *ngIf="notification.type === 'success'">✅</span>
            <span *ngIf="notification.type === 'error'">❌</span>
            <span *ngIf="notification.type === 'warning'">⚠️</span>
            <span *ngIf="notification.type === 'info'">ℹ️</span>
          </span>
          <h4>{{ notification.title }}</h4>
          <button (click)="removeNotification(notification.id)" class="close-btn">×</button>
        </div>
        <p>{{ notification.message }}</p>
        <small>{{ notification.timestamp | date:'short' }}</small>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
    }

    .notification-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-left: 4px solid #ccc;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .notification-item:hover {
      transform: translateX(-5px);
    }

    .notification-item.success {
      border-left-color: #4caf50;
    }

    .notification-item.error {
      border-left-color: #f44336;
    }

    .notification-item.warning {
      border-left-color: #ff9800;
    }

    .notification-item.info {
      border-left-color: #2196f3;
    }

    .notification-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .notification-header h4 {
      margin: 0;
      flex: 1;
      font-size: 1rem;
      color: #333;
    }

    .notification-icon {
      font-size: 1.2rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .notification-item p {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .notification-item small {
      color: #999;
      font-size: 0.8rem;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });

    // Listen for real-time notifications
    this.socketService.onStockUpdate().subscribe(data => {
      this.notificationService.addNotification({
        type: 'info',
        title: 'Stock Updated',
        message: `Product stock updated to ${data.newStock} units`
      });
    });

    this.socketService.onOrderUpdate().subscribe(data => {
      this.notificationService.addNotification({
        type: 'success',
        title: 'Order Updated',
        message: `Your order #${data.id} status changed to ${data.status}`
      });
    });

    this.socketService.onNewOrder().subscribe(data => {
      this.notificationService.addNotification({
        type: 'info',
        title: 'New Order',
        message: `New order #${data.id} from ${data.first_name} ${data.last_name}`
      });
    });
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}