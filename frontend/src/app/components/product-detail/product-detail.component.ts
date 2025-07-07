import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product, Review } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-detail-page" *ngIf="product">
      <div class="container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>›</span>
          <a routerLink="/products">Products</a>
          <span>›</span>
          <a [routerLink]="['/products']" [queryParams]="{category: product.category}">{{ product.category }}</a>
          <span>›</span>
          <span>{{ product.name }}</span>
        </nav>

        <!-- Product Main Section -->
        <div class="product-main">
          <!-- Product Images -->
          <div class="product-images">
            <div class="main-image">
              <img [src]="selectedImage" [alt]="product.name" />
              <div class="image-badges">
                <span *ngIf="product.rating >= 4.5" class="badge bestseller">⭐ Best Seller</span>
                <span *ngIf="product.stock < 10" class="badge low-stock">⚠️ Low Stock</span>
                <span *ngIf="product.stock === 0" class="badge out-of-stock">❌ Out of Stock</span>
              </div>
            </div>
            <div class="thumbnail-images">
              <img 
                *ngFor="let image of productImages" 
                [src]="image" 
                [alt]="product.name"
                [class.active]="image === selectedImage"
                (click)="selectImage(image)"
              />
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <div class="product-header">
              <h1>{{ product.name }}</h1>
              <p class="brand">by {{ product.brand }}</p>
              
              <div class="rating-section">
                <div class="stars">
                  <span *ngFor="let star of getStars(product.rating)" class="star filled">⭐</span>
                  <span *ngFor="let star of getEmptyStars(product.rating)" class="star empty">☆</span>
                </div>
                <span class="rating-text">({{ product.rating }}) • {{ product.reviews.length }} reviews</span>
              </div>
            </div>

            <div class="pricing">
              <div class="price-main">₹{{ product.price | number:'1.0-0' }}</div>
              <div class="price-original" *ngIf="product.price < 50000">₹{{ (product.price * 1.2) | number:'1.0-0' }}</div>
              <div class="discount" *ngIf="product.price < 50000">17% OFF</div>
            </div>

            <div class="product-highlights">
              <h3>Key Features</h3>
              <ul>
                <li>Premium quality {{ product.category.toLowerCase() }}</li>
                <li>{{ product.brand }} brand guarantee</li>
                <li>Free shipping on orders above ₹4149</li>
                <li>30-day return policy</li>
                <li *ngIf="product.rating >= 4.5">Highly rated by customers</li>
              </ul>
            </div>

            <div class="product-options">
              <div class="quantity-selector" *ngIf="product.stock > 0">
                <label>Quantity:</label>
                <div class="quantity-controls">
                  <button (click)="decreaseQuantity()" [disabled]="selectedQuantity <= 1">-</button>
                  <span class="quantity">{{ selectedQuantity }}</span>
                  <button (click)="increaseQuantity()" [disabled]="selectedQuantity >= product.stock">+</button>
                </div>
                <span class="stock-info">{{ product.stock }} available</span>
              </div>

              <div class="action-buttons">
                <button 
                  (click)="addToCart()" 
                  class="add-to-cart-btn"
                  [disabled]="product.stock === 0 || isAddingToCart"
                >
                  <span *ngIf="!isAddingToCart && product.stock > 0">🛒 Add to Cart</span>
                  <span *ngIf="isAddingToCart">Adding...</span>
                  <span *ngIf="product.stock === 0">Out of Stock</span>
                </button>
                
                <button 
                  (click)="toggleWishlist()" 
                  class="wishlist-btn"
                  [class.active]="isInWishlist"
                >
                  <span>{{ isInWishlist ? '❤️' : '🤍' }} {{ isInWishlist ? 'In Wishlist' : 'Add to Wishlist' }}</span>
                </button>
              </div>
            </div>

            <div class="delivery-info">
              <h3>Delivery Information</h3>
              <div class="delivery-options">
                <div class="delivery-option">
                  <span class="icon">🚚</span>
                  <div>
                    <strong>Standard Delivery</strong>
                    <p>5-7 business days • ₹495 (Free above ₹4149)</p>
                  </div>
                </div>
                <div class="delivery-option">
                  <span class="icon">⚡</span>
                  <div>
                    <strong>Express Delivery</strong>
                    <p>2-3 business days • ₹995</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Details Tabs -->
        <div class="product-details">
          <div class="tabs">
            <button 
              *ngFor="let tab of tabs" 
              [class.active]="activeTab === tab.id"
              (click)="setActiveTab(tab.id)"
              class="tab-button"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <!-- Description Tab -->
            <div *ngIf="activeTab === 'description'" class="tab-panel">
              <h3>Product Description</h3>
              <p>{{ product.description }}</p>
              <div class="detailed-description">
                <p>This premium {{ product.category.toLowerCase() }} from {{ product.brand }} represents the perfect blend of quality, functionality, and style. Designed with attention to detail and built to last, this product offers exceptional value for money.</p>
                <p>Whether you're looking for everyday use or special occasions, this {{ product.name.toLowerCase() }} delivers outstanding performance and reliability. The thoughtful design ensures comfort and convenience while maintaining the highest standards of quality.</p>
              </div>
            </div>

            <!-- Specifications Tab -->
            <div *ngIf="activeTab === 'specifications'" class="tab-panel">
              <h3>Specifications</h3>
              <div class="specifications-grid">
                <div class="spec-item">
                  <span class="spec-label">Brand:</span>
                  <span class="spec-value">{{ product.brand }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Category:</span>
                  <span class="spec-value">{{ product.category }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Model:</span>
                  <span class="spec-value">{{ product.name }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Rating:</span>
                  <span class="spec-value">{{ product.rating }}/5 ⭐</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Availability:</span>
                  <span class="spec-value">{{ product.stock > 0 ? 'In Stock (' + product.stock + ' units)' : 'Out of Stock' }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Warranty:</span>
                  <span class="spec-value">1 Year Manufacturer Warranty</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Return Policy:</span>
                  <span class="spec-value">30 Days Easy Return</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">Shipping:</span>
                  <span class="spec-value">Free shipping on orders above ₹4149</span>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div *ngIf="activeTab === 'reviews'" class="tab-panel">
              <div class="reviews-section">
                <div class="reviews-header">
                  <h3>Customer Reviews</h3>
                  <div class="rating-summary">
                    <div class="overall-rating">
                      <span class="rating-number">{{ product.rating }}</span>
                      <div class="stars">
                        <span *ngFor="let star of getStars(product.rating)" class="star">⭐</span>
                      </div>
                      <span class="review-count">Based on {{ reviews.length }} reviews</span>
                    </div>
                  </div>
                </div>

                <div class="rating-breakdown">
                  <div *ngFor="let rating of ratingBreakdown" class="rating-bar">
                    <span class="rating-label">{{ rating.stars }} ⭐</span>
                    <div class="bar-container">
                      <div class="bar-fill" [style.width.%]="rating.percentage"></div>
                    </div>
                    <span class="rating-count">{{ rating.count }}</span>
                  </div>
                </div>

                <div class="reviews-list">
                  <div *ngFor="let review of reviews" class="review-item">
                    <div class="review-header">
                      <div class="reviewer-info">
                        <span class="reviewer-name">{{ review.userName }}</span>
                        <div class="review-rating">
                          <span *ngFor="let star of getStars(review.rating)" class="star">⭐</span>
                        </div>
                      </div>
                      <span class="review-date">{{ review.date | date:'mediumDate' }}</span>
                    </div>
                    <p class="review-comment">{{ review.comment }}</p>
                  </div>
                </div>

                <div class="write-review" *ngIf="!showReviewForm">
                  <button (click)="showReviewForm = true" class="write-review-btn">
                    ✍️ Write a Review
                  </button>
                </div>

                <div class="review-form" *ngIf="showReviewForm">
                  <h4>Write Your Review</h4>
                  <form (ngSubmit)="submitReview()">
                    <div class="form-group">
                      <label>Rating:</label>
                      <div class="star-rating">
                        <span 
                          *ngFor="let star of [1,2,3,4,5]" 
                          class="star-input"
                          [class.selected]="star <= newReview.rating"
                          (click)="setRating(star)"
                        >
                          ⭐
                        </span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Your Review:</label>
                      <textarea 
                        [(ngModel)]="newReview.comment" 
                        name="comment"
                        placeholder="Share your experience with this product..."
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="submit-btn" [disabled]="!newReview.rating || !newReview.comment">
                        Submit Review
                      </button>
                      <button type="button" (click)="cancelReview()" class="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div class="related-products">
          <h3>Related Products</h3>
          <div class="products-grid">
            <div *ngFor="let relatedProduct of relatedProducts" class="related-product-card">
              <img [src]="relatedProduct.image" [alt]="relatedProduct.name" />
              <h4>{{ relatedProduct.name }}</h4>
              <p class="price">₹{{ relatedProduct.price | number:'1.0-0' }}</p>
              <button (click)="viewProduct(relatedProduct.id)" class="view-btn">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="!product && loading">
      <div class="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div class="error-container" *ngIf="!product && !loading">
      <h3>Product not found</h3>
      <p>The product you're looking for doesn't exist.</p>
      <button routerLink="/products" class="back-btn">Back to Products</button>
    </div>
  `,
  styles: [`
    .product-detail-page {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.9rem;
    }

    .breadcrumb a {
      color: #1976D2;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .breadcrumb span:last-child {
      color: #666;
    }

    .product-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .main-image {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .image-badges {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .badge.bestseller {
      background: #FF9800;
      color: white;
    }

    .badge.low-stock {
      background: #ff9800;
      color: white;
    }

    .badge.out-of-stock {
      background: #f44336;
      color: white;
    }

    .thumbnail-images {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
    }

    .thumbnail-images img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.3s;
    }

    .thumbnail-images img.active {
      border-color: #1976D2;
    }

    .thumbnail-images img:hover {
      border-color: #1976D2;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.8rem;
    }

    .brand {
      color: #666;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
    }

    .rating-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stars {
      display: flex;
      gap: 0.1rem;
    }

    .star {
      font-size: 1.2rem;
    }

    .star.filled {
      color: #FF9800;
    }

    .star.empty {
      color: #ddd;
    }

    .rating-text {
      color: #666;
      font-size: 0.9rem;
    }

    .pricing {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }

    .price-main {
      font-size: 2rem;
      font-weight: 700;
      color: #1976D2;
    }

    .price-original {
      font-size: 1.2rem;
      color: #999;
      text-decoration: line-through;
    }

    .discount {
      background: #4caf50;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .product-highlights h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .product-highlights ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .product-highlights li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
      padding-left: 1.5rem;
    }

    .product-highlights li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #4caf50;
      font-weight: bold;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 6px;
      overflow: hidden;
    }

    .quantity-controls button {
      background: #f8f9fa;
      border: none;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: background 0.3s;
    }

    .quantity-controls button:hover:not(:disabled) {
      background: #e9ecef;
    }

    .quantity-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      padding: 0 1rem;
      font-weight: 600;
      min-width: 60px;
      text-align: center;
    }

    .stock-info {
      color: #666;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .add-to-cart-btn {
      flex: 2;
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

    .add-to-cart-btn:hover:not(:disabled) {
      background: #1565C0;
    }

    .add-to-cart-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .wishlist-btn {
      flex: 1;
      background: none;
      border: 2px solid #ddd;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    .wishlist-btn:hover {
      border-color: #FF5722;
      background: #FFF3E0;
    }

    .wishlist-btn.active {
      border-color: #FF5722;
      background: #FFE0E6;
      color: #FF5722;
    }

    .delivery-info h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .delivery-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .delivery-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
    }

    .delivery-option .icon {
      font-size: 1.5rem;
    }

    .delivery-option strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .delivery-option p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .product-details {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid #eee;
    }

    .tab-button {
      background: none;
      border: none;
      padding: 1rem 2rem;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
    }

    .tab-button.active {
      color: #1976D2;
      border-bottom-color: #1976D2;
    }

    .tab-button:hover {
      color: #1976D2;
    }

    .tab-content {
      padding: 2rem;
    }

    .tab-panel h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .detailed-description {
      margin-top: 1.5rem;
    }

    .detailed-description p {
      margin-bottom: 1rem;
      line-height: 1.6;
      color: #666;
    }

    .specifications-grid {
      display: grid;
      gap: 1rem;
    }

    .spec-item {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .spec-label {
      font-weight: 600;
      color: #333;
    }

    .spec-value {
      color: #666;
    }

    .reviews-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .reviews-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rating-summary {
      text-align: center;
    }

    .overall-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .rating-number {
      font-size: 2rem;
      font-weight: 700;
      color: #1976D2;
    }

    .review-count {
      color: #666;
      font-size: 0.9rem;
    }

    .rating-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .rating-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rating-label {
      min-width: 60px;
      font-size: 0.9rem;
    }

    .bar-container {
      flex: 1;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: #FF9800;
      transition: width 0.3s;
    }

    .rating-count {
      min-width: 40px;
      text-align: right;
      font-size: 0.9rem;
      color: #666;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .review-item {
      padding: 1.5rem;
      border: 1px solid #eee;
      border-radius: 8px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .reviewer-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .reviewer-name {
      font-weight: 600;
      color: #333;
    }

    .review-rating {
      display: flex;
      gap: 0.1rem;
    }

    .review-date {
      color: #666;
      font-size: 0.9rem;
    }

    .review-comment {
      margin: 0;
      line-height: 1.6;
      color: #666;
    }

    .write-review {
      text-align: center;
    }

    .write-review-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .review-form {
      padding: 2rem;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .review-form h4 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .star-rating {
      display: flex;
      gap: 0.25rem;
    }

    .star-input {
      font-size: 1.5rem;
      cursor: pointer;
      color: #ddd;
      transition: color 0.3s;
    }

    .star-input.selected {
      color: #FF9800;
    }

    .star-input:hover {
      color: #FF9800;
    }

    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    .submit-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .cancel-btn {
      background: #666;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .related-products {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .related-products h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .related-product-card {
      text-align: center;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      transition: transform 0.3s;
    }

    .related-product-card:hover {
      transform: translateY(-2px);
    }

    .related-product-card img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .related-product-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #333;
    }

    .related-product-card .price {
      color: #1976D2;
      font-weight: 600;
      margin: 0 0 1rem 0;
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

    .loading-container,
    .error-container {
      text-align: center;
      padding: 4rem 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1976D2;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .back-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .product-main {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .tabs {
        flex-wrap: wrap;
      }

      .tab-button {
        flex: 1;
        min-width: 120px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .spec-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .rating-bar {
        flex-wrap: wrap;
      }

      .review-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  selectedImage = '';
  productImages: string[] = [];
  selectedQuantity = 1;
  isAddingToCart = false;
  isInWishlist = false;
  activeTab = 'description';
  showReviewForm = false;
  reviews: Review[] = [];
  relatedProducts: Product[] = [];
  ratingBreakdown: any[] = [];

  tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' }
  ];

  newReview = {
    rating: 0,
    comment: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.selectedImage = product.image;
          this.generateProductImages();
          this.generateReviews();
          this.generateRatingBreakdown();
          this.loadRelatedProducts();
          this.checkWishlistStatus();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    });
  }

  generateProductImages(): void {
    if (this.product) {
      // Generate multiple images for the product (in real app, these would come from API)
      this.productImages = [
        this.product.image,
        this.product.image, // In real app, these would be different angles
        this.product.image,
        this.product.image
      ];
    }
  }

  generateReviews(): void {
    // Generate mock reviews (in real app, these would come from API)
    this.reviews = [
      {
        id: 1,
        userId: 1,
        userName: 'Rajesh Kumar',
        rating: 5,
        comment: 'Excellent product! Great quality and fast delivery. Highly recommended.',
        date: new Date('2024-01-10')
      },
      {
        id: 2,
        userId: 2,
        userName: 'Priya Sharma',
        rating: 4,
        comment: 'Good value for money. The product works as expected and the build quality is decent.',
        date: new Date('2024-01-08')
      },
      {
        id: 3,
        userId: 3,
        userName: 'Amit Singh',
        rating: 5,
        comment: 'Amazing product! Exceeded my expectations. Will definitely buy again.',
        date: new Date('2024-01-05')
      },
      {
        id: 4,
        userId: 4,
        userName: 'Sneha Patel',
        rating: 4,
        comment: 'Very satisfied with the purchase. Good packaging and quick delivery.',
        date: new Date('2024-01-03')
      }
    ];

    if (this.product) {
      this.product.reviews = this.reviews;
    }
  }

  generateRatingBreakdown(): void {
    const ratings = [0, 0, 0, 0, 0]; // 1-5 stars
    this.reviews.forEach(review => {
      ratings[review.rating - 1]++;
    });

    this.ratingBreakdown = ratings.map((count, index) => ({
      stars: index + 1,
      count,
      percentage: this.reviews.length > 0 ? (count / this.reviews.length) * 100 : 0
    })).reverse();
  }

  loadRelatedProducts(): void {
    if (this.product) {
      this.productService.getProducts(1, 4, this.product.category).subscribe({
        next: (response) => {
          this.relatedProducts = response.products.filter(p => p.id !== this.product!.id).slice(0, 4);
        },
        error: (error) => {
          console.error('Error loading related products:', error);
        }
      });
    }
  }

  checkWishlistStatus(): void {
    if (this.product) {
      this.isInWishlist = this.wishlistService.isInWishlist(this.product.id);
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getStars(rating: number): number[] {
    return new Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return new Array(5 - Math.floor(rating)).fill(0);
  }

  increaseQuantity(): void {
    if (this.product && this.selectedQuantity < this.product.stock) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  addToCart(): void {
    if (!this.product || this.product.stock === 0 || this.isAddingToCart) return;
    
    this.isAddingToCart = true;
    
    this.cartService.addToCart(this.product, this.selectedQuantity).subscribe({
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
    if (!this.product) return;

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe(() => {
        this.isInWishlist = false;
      });
    } else {
      this.wishlistService.addToWishlist(this.product).subscribe(() => {
        this.isInWishlist = true;
      });
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  submitReview(): void {
    if (this.newReview.rating && this.newReview.comment.trim()) {
      const review: Review = {
        id: this.reviews.length + 1,
        userId: 1, // In real app, get from auth service
        userName: 'Current User', // In real app, get from auth service
        rating: this.newReview.rating,
        comment: this.newReview.comment.trim(),
        date: new Date()
      };

      this.reviews.unshift(review);
      this.generateRatingBreakdown();
      this.cancelReview();
    }
  }

  cancelReview(): void {
    this.showReviewForm = false;
    this.newReview = { rating: 0, comment: '' };
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}