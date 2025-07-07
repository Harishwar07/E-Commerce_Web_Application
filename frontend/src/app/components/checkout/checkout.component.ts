import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem } from '../../models/cart.model';
import { User } from '../../models/user.model';
import { Order, OrderItem } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page">
      <div class="container">
        <div class="checkout-header">
          <h1>Checkout</h1>
          <div class="checkout-steps">
            <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
              <span class="step-number">1</span>
              <span class="step-label">Shipping</span>
            </div>
            <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
              <span class="step-number">2</span>
              <span class="step-label">Payment</span>
            </div>
            <div class="step" [class.active]="currentStep >= 3">
              <span class="step-number">3</span>
              <span class="step-label">Review</span>
            </div>
          </div>
        </div>

        <div class="checkout-content" *ngIf="cartItems.length > 0; else emptyCart">
          <div class="checkout-main">
            <!-- Step 1: Shipping Information -->
            <div class="checkout-section" *ngIf="currentStep === 1">
              <h2>Shipping Information</h2>
              <form (ngSubmit)="proceedToPayment()" #shippingForm="ngForm">
                <div class="form-row">
                  <div class="form-group">
                    <label>First Name *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="shippingInfo.firstName" 
                      name="firstName"
                      required
                      class="form-control"
                    />
                  </div>
                  <div class="form-group">
                    <label>Last Name *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="shippingInfo.lastName" 
                      name="lastName"
                      required
                      class="form-control"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    [(ngModel)]="shippingInfo.email" 
                    name="email"
                    required
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="shippingInfo.phone" 
                    name="phone"
                    required
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label>Address *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="shippingInfo.address" 
                    name="address"
                    required
                    placeholder="Street address"
                    class="form-control"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>City *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="shippingInfo.city" 
                      name="city"
                      required
                      class="form-control"
                    />
                  </div>
                  <div class="form-group">
                    <label>State *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="shippingInfo.state" 
                      name="state"
                      required
                      class="form-control"
                    />
                  </div>
                  <div class="form-group">
                    <label>ZIP Code *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="shippingInfo.zipCode" 
                      name="zipCode"
                      required
                      class="form-control"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Country *</label>
                  <select [(ngModel)]="shippingInfo.country" name="country" required class="form-control">
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div class="shipping-options">
                  <h3>Shipping Method</h3>
                  <div class="shipping-option">
                    <label class="radio-label">
                      <input 
                        type="radio" 
                        [(ngModel)]="selectedShipping" 
                        name="shipping"
                        value="standard"
                      />
                      <div class="option-content">
                        <strong>Standard Delivery (5-7 days)</strong>
                        <span class="price">{{ getSubtotal() > 4149 ? 'FREE' : '₹495' }}</span>
                      </div>
                    </label>
                  </div>
                  <div class="shipping-option">
                    <label class="radio-label">
                      <input 
                        type="radio" 
                        [(ngModel)]="selectedShipping" 
                        name="shipping"
                        value="express"
                      />
                      <div class="option-content">
                        <strong>Express Delivery (2-3 days)</strong>
                        <span class="price">₹995</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" routerLink="/cart" class="btn-secondary">
                    ← Back to Cart
                  </button>
                  <button type="submit" class="btn-primary" [disabled]="shippingForm.invalid">
                    Continue to Payment →
                  </button>
                </div>
              </form>
            </div>

            <!-- Step 2: Payment Information -->
            <div class="checkout-section" *ngIf="currentStep === 2">
              <h2>Payment Information</h2>
              <form (ngSubmit)="proceedToReview()" #paymentForm="ngForm">
                <div class="payment-methods">
                  <h3>Payment Method</h3>
                  <div class="payment-option">
                    <label class="radio-label">
                      <input 
                        type="radio" 
                        [(ngModel)]="selectedPayment" 
                        name="payment"
                        value="card"
                      />
                      <div class="option-content">
                        <strong>💳 Credit/Debit Card</strong>
                        <span>Visa, Mastercard, RuPay</span>
                      </div>
                    </label>
                  </div>
                  <div class="payment-option">
                    <label class="radio-label">
                      <input 
                        type="radio" 
                        [(ngModel)]="selectedPayment" 
                        name="payment"
                        value="upi"
                      />
                      <div class="option-content">
                        <strong>📱 UPI</strong>
                        <span>PhonePe, Google Pay, Paytm</span>
                      </div>
                    </label>
                  </div>
                  <div class="payment-option">
                    <label class="radio-label">
                      <input 
                        type="radio" 
                        [(ngModel)]="selectedPayment" 
                        name="payment"
                        value="wallet"
                      />
                      <div class="option-content">
                        <strong>💰 Digital Wallet</strong>
                        <span>Paytm, Amazon Pay</span>
                      </div>
                    </label>
                  </div>
                  <div class="payment-option">
                    <label class="radio-label">
                      <input 
                        type="radio" 
                        [(ngModel)]="selectedPayment" 
                        name="payment"
                        value="cod"
                      />
                      <div class="option-content">
                        <strong>💵 Cash on Delivery</strong>
                        <span>Pay when you receive</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="card-details" *ngIf="selectedPayment === 'card'">
                  <div class="form-group">
                    <label>Card Number *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="paymentInfo.cardNumber" 
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      [required]="selectedPayment === 'card'"
                      class="form-control"
                      maxlength="19"
                      (input)="formatCardNumber($event)"
                    />
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Expiry Date *</label>
                      <input 
                        type="text" 
                        [(ngModel)]="paymentInfo.expiryDate" 
                        name="expiryDate"
                        placeholder="MM/YY"
                        [required]="selectedPayment === 'card'"
                        class="form-control"
                        maxlength="5"
                        (input)="formatExpiryDate($event)"
                      />
                    </div>
                    <div class="form-group">
                      <label>CVV *</label>
                      <input 
                        type="text" 
                        [(ngModel)]="paymentInfo.cvv" 
                        name="cvv"
                        placeholder="123"
                        [required]="selectedPayment === 'card'"
                        class="form-control"
                        maxlength="4"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Cardholder Name *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="paymentInfo.cardholderName" 
                      name="cardholderName"
                      [required]="selectedPayment === 'card'"
                      class="form-control"
                    />
                  </div>
                </div>

                <div class="upi-details" *ngIf="selectedPayment === 'upi'">
                  <div class="form-group">
                    <label>UPI ID *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="paymentInfo.upiId" 
                      name="upiId"
                      placeholder="yourname@paytm"
                      [required]="selectedPayment === 'upi'"
                      class="form-control"
                    />
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" (click)="goToStep(1)" class="btn-secondary">
                    ← Back to Shipping
                  </button>
                  <button type="submit" class="btn-primary" [disabled]="!isPaymentValid()">
                    Review Order →
                  </button>
                </div>
              </form>
            </div>

            <!-- Step 3: Order Review -->
            <div class="checkout-section" *ngIf="currentStep === 3">
              <h2>Review Your Order</h2>
              
              <div class="review-sections">
                <div class="review-section">
                  <h3>Shipping Address</h3>
                  <div class="address-display">
                    <p><strong>{{ shippingInfo.firstName }} {{ shippingInfo.lastName }}</strong></p>
                    <p>{{ shippingInfo.address }}</p>
                    <p>{{ shippingInfo.city }}, {{ shippingInfo.state }} {{ shippingInfo.zipCode }}</p>
                    <p>{{ shippingInfo.country }}</p>
                    <p>{{ shippingInfo.phone }}</p>
                  </div>
                  <button (click)="goToStep(1)" class="edit-btn">Edit</button>
                </div>

                <div class="review-section">
                  <h3>Payment Method</h3>
                  <div class="payment-display">
                    <p *ngIf="selectedPayment === 'card'">
                      <strong>💳 Credit/Debit Card</strong><br>
                      **** **** **** {{ paymentInfo.cardNumber.slice(-4) }}
                    </p>
                    <p *ngIf="selectedPayment === 'upi'">
                      <strong>📱 UPI</strong><br>
                      {{ paymentInfo.upiId }}
                    </p>
                    <p *ngIf="selectedPayment === 'wallet'">
                      <strong>💰 Digital Wallet</strong>
                    </p>
                    <p *ngIf="selectedPayment === 'cod'">
                      <strong>💵 Cash on Delivery</strong>
                    </p>
                  </div>
                  <button (click)="goToStep(2)" class="edit-btn">Edit</button>
                </div>

                <div class="review-section">
                  <h3>Shipping Method</h3>
                  <div class="shipping-display">
                    <p *ngIf="selectedShipping === 'standard'">
                      <strong>Standard Delivery (5-7 days)</strong><br>
                      {{ getSubtotal() > 4149 ? 'FREE' : '₹495' }}
                    </p>
                    <p *ngIf="selectedShipping === 'express'">
                      <strong>Express Delivery (2-3 days)</strong><br>
                      ₹995
                    </p>
                  </div>
                  <button (click)="goToStep(1)" class="edit-btn">Edit</button>
                </div>
              </div>

              <div class="order-items-review">
                <h3>Order Items</h3>
                <div class="items-list">
                  <div *ngFor="let item of cartItems" class="review-item">
                    <img [src]="item.product.image" [alt]="item.product.name" />
                    <div class="item-details">
                      <h4>{{ item.product.name }}</h4>
                      <p>Quantity: {{ item.quantity }}</p>
                      <p class="item-price">₹{{ (item.product.price * item.quantity) | number:'1.0-0' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" (click)="goToStep(2)" class="btn-secondary">
                  ← Back to Payment
                </button>
                <button 
                  (click)="placeOrder()" 
                  class="btn-primary place-order-btn"
                  [disabled]="isPlacingOrder"
                >
                  <span *ngIf="!isPlacingOrder">🛒 Place Order (₹{{ getTotal() | number:'1.0-0' }})</span>
                  <span *ngIf="isPlacingOrder">Processing...</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="order-summary">
            <div class="summary-card">
              <h3>Order Summary</h3>
              
              <div class="summary-items">
                <div *ngFor="let item of cartItems" class="summary-item">
                  <img [src]="item.product.image" [alt]="item.product.name" />
                  <div class="item-info">
                    <span class="item-name">{{ item.product.name }}</span>
                    <span class="item-qty">Qty: {{ item.quantity }}</span>
                  </div>
                  <span class="item-total">₹{{ (item.product.price * item.quantity) | number:'1.0-0' }}</span>
                </div>
              </div>
              
              <div class="summary-calculations">
                <div class="summary-row">
                  <span>Subtotal ({{ getTotalItems() }} items)</span>
                  <span>₹{{ getSubtotal() | number:'1.0-0' }}</span>
                </div>
                
                <div class="summary-row">
                  <span>Shipping</span>
                  <span>{{ getShippingCost() === 0 ? 'FREE' : '₹' + (getShippingCost() | number:'1.0-0') }}</span>
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
              </div>

              <div class="security-badges">
                <div class="security-item">
                  <span class="icon">🔒</span>
                  <span>Secure Payment</span>
                </div>
                <div class="security-item">
                  <span class="icon">🚚</span>
                  <span>Free Returns</span>
                </div>
                <div class="security-item">
                  <span class="icon">📞</span>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyCart>
          <div class="empty-checkout">
            <div class="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to proceed with checkout</p>
            <button routerLink="/products" class="btn-primary">
              Continue Shopping
            </button>
          </div>
        </ng-template>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal-overlay" *ngIf="showSuccessModal" (click)="closeSuccessModal()">
      <div class="success-modal" (click)="$event.stopPropagation()">
        <div class="success-icon">✅</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order #{{ orderNumber }} has been confirmed.</p>
        <p>You will receive an email confirmation shortly.</p>
        <div class="modal-actions">
          <button (click)="goToOrders()" class="btn-primary">View My Orders</button>
          <button (click)="continueShopping()" class="btn-secondary">Continue Shopping</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .checkout-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .checkout-header h1 {
      margin: 0 0 2rem 0;
      color: #333;
      font-size: 2.5rem;
    }

    .checkout-steps {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
      transition: opacity 0.3s;
    }

    .step.active {
      opacity: 1;
    }

    .step.completed {
      opacity: 1;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0e0e0;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      transition: all 0.3s;
    }

    .step.active .step-number {
      background: #1976D2;
      color: white;
    }

    .step.completed .step-number {
      background: #4caf50;
      color: white;
    }

    .step-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #666;
    }

    .step.active .step-label,
    .step.completed .step-label {
      color: #333;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .checkout-main {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .checkout-section h2 {
      margin: 0 0 2rem 0;
      color: #333;
      font-size: 1.8rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .shipping-options,
    .payment-methods {
      margin: 2rem 0;
    }

    .shipping-options h3,
    .payment-methods h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .shipping-option,
    .payment-option {
      margin-bottom: 1rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .radio-label:hover {
      border-color: #1976D2;
      background: #f8f9fa;
    }

    .radio-label input[type="radio"]:checked + .option-content {
      color: #1976D2;
    }

    .radio-label:has(input[type="radio"]:checked) {
      border-color: #1976D2;
      background: #f0f7ff;
    }

    .option-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .option-content strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .option-content span:last-child {
      font-weight: 600;
      color: #1976D2;
    }

    .card-details,
    .upi-details {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .review-sections {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .review-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .review-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .address-display,
    .payment-display,
    .shipping-display {
      flex: 1;
    }

    .address-display p,
    .payment-display p,
    .shipping-display p {
      margin: 0 0 0.5rem 0;
      color: #666;
    }

    .edit-btn {
      background: none;
      border: 1px solid #1976D2;
      color: #1976D2;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .edit-btn:hover {
      background: #1976D2;
      color: white;
    }

    .order-items-review {
      margin-bottom: 2rem;
    }

    .order-items-review h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .review-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
    }

    .review-item .item-details {
      flex: 1;
    }

    .review-item h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
    }

    .review-item p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .review-item .item-price {
      color: #1976D2 !important;
      font-weight: 600 !important;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary,
    .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: #1976D2;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1565C0;
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #666;
      color: white;
    }

    .btn-secondary:hover {
      background: #555;
      transform: translateY(-2px);
    }

    .place-order-btn {
      font-size: 1.2rem;
      padding: 1.25rem 2.5rem;
    }

    .order-summary {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .summary-card h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .summary-items {
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .summary-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .summary-item img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 6px;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item-name {
      font-size: 0.9rem;
      color: #333;
      font-weight: 600;
    }

    .item-qty {
      font-size: 0.8rem;
      color: #666;
    }

    .item-total {
      font-weight: 600;
      color: #1976D2;
    }

    .summary-calculations {
      border-top: 1px solid #eee;
      padding-top: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: #666;
    }

    .summary-row.total {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #eee;
    }

    .security-badges {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }

    .security-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      color: #666;
    }

    .security-item .icon {
      font-size: 1.2rem;
    }

    .empty-checkout {
      text-align: center;
      padding: 4rem 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-checkout h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .empty-checkout p {
      color: #666;
      margin-bottom: 2rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .success-modal {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .success-modal h2 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .success-modal p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .modal-actions button {
      flex: 1;
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .checkout-steps {
        gap: 1rem;
      }

      .step-number {
        width: 35px;
        height: 35px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .review-section {
        flex-direction: column;
        gap: 1rem;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  currentUser: User | null = null;
  currentStep = 1;
  isPlacingOrder = false;
  showSuccessModal = false;
  orderNumber = '';

  selectedShipping = 'standard';
  selectedPayment = 'card';

  shippingInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  };

  paymentInfo = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: ''
  };

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadUserInfo();
  }

  loadCart(): void {
    this.cartService.cart.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  loadUserInfo(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.shippingInfo.firstName = user.name?.split(' ')[0] || '';
        this.shippingInfo.lastName = user.name?.split(' ')[1] || '';
        this.shippingInfo.email = user.email;
      }
    });
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  proceedToPayment(): void {
    this.currentStep = 2;
  }

  proceedToReview(): void {
    this.currentStep = 3;
  }

  isPaymentValid(): boolean {
    if (this.selectedPayment === 'card') {
      return !!(this.paymentInfo.cardNumber && 
                this.paymentInfo.expiryDate && 
                this.paymentInfo.cvv && 
                this.paymentInfo.cardholderName);
    } else if (this.selectedPayment === 'upi') {
      return !!this.paymentInfo.upiId;
    }
    return true; // For wallet and COD
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.paymentInfo.cardNumber = formattedValue;
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentInfo.expiryDate = value;
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getShippingCost(): number {
    if (this.selectedShipping === 'express') {
      return 995;
    }
    return this.getSubtotal() > 4149 ? 0 : 495;
  }

  getTax(): number {
    return this.getSubtotal() * 0.18; // 18% GST
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() + this.getTax();
  }

  placeOrder(): void {
    if (!this.currentUser) {
      this.notificationService.addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please login to place an order'
      });
      this.router.navigate(['/login']);
      return;
    }

    this.isPlacingOrder = true;

    // Simulate order processing
    setTimeout(() => {
      this.orderNumber = 'ORD' + Date.now();
      
      // Create order object
      const order: Order = {
        id: parseInt(this.orderNumber.replace('ORD', '')),
        userId: this.currentUser!.id,
        items: this.cartItems.map(item => ({
          id: item.id,
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        total: this.getTotal(),
        status: 'pending' as any,
        shippingAddress: {
          street: this.shippingInfo.address,
          city: this.shippingInfo.city,
          state: this.shippingInfo.state,
          zipCode: this.shippingInfo.zipCode,
          country: this.shippingInfo.country
        },
        paymentMethod: this.getPaymentMethodDisplay(),
        createdAt: new Date(),
        estimatedDelivery: this.getEstimatedDelivery()
      };

      // Save order to localStorage (in real app, this would be saved to backend)
      this.saveOrderToStorage(order);
      
      // Clear cart
      this.cartService.clearCart().subscribe();
      
      // Show success modal
      this.showSuccessModal = true;
      this.isPlacingOrder = false;

      this.notificationService.addNotification({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Your order #${this.orderNumber} has been confirmed`
      });
    }, 2000);
  }

  private getPaymentMethodDisplay(): string {
    const paymentMethods: { [key: string]: string } = {
      'card': 'Credit/Debit Card',
      'upi': 'UPI',
      'wallet': 'Digital Wallet',
      'cod': 'Cash on Delivery'
    };
    return paymentMethods[this.selectedPayment] || this.selectedPayment;
  }

  private getEstimatedDelivery(): Date {
    const days = this.selectedShipping === 'express' ? 3 : 7;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate;
  }

  private saveOrderToStorage(order: Order): void {
    const existingOrders = localStorage.getItem('userOrders');
    let orders: Order[] = [];
    
    if (existingOrders) {
      try {
        orders = JSON.parse(existingOrders);
      } catch (error) {
        console.error('Error parsing existing orders:', error);
      }
    }
    
    orders.unshift(order); // Add new order at the beginning
    localStorage.setItem('userOrders', JSON.stringify(orders));
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  goToOrders(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/orders']);
  }

  continueShopping(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/products']);
  }
}