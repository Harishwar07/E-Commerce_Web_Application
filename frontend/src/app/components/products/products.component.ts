import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="products-page">
      <div class="container">
        <!-- Filters Section -->
        <div class="filters-section">
          <div class="filters-header">
            <h2>Products</h2>
            <div class="results-info">
              <span>{{ totalProducts }} products found</span>
            </div>
          </div>

          <div class="filters-container">
            <!-- Category Filter -->
            <div class="filter-group">
              <label>Category</label>
              <select [(ngModel)]="selectedCategory" (change)="onFilterChange()" class="filter-select">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category.name">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <label>Price Range</label>
              <div class="price-inputs">
                <input 
                  type="number" 
                  [(ngModel)]="minPrice" 
                  (change)="onFilterChange()"
                  placeholder="Min" 
                  class="price-input"
                />
                <span>-</span>
                <input 
                  type="number" 
                  [(ngModel)]="maxPrice" 
                  (change)="onFilterChange()"
                  placeholder="Max" 
                  class="price-input"
                />
              </div>
            </div>

            <!-- Sort By -->
            <div class="filter-group">
              <label>Sort By</label>
              <select [(ngModel)]="sortBy" (change)="onFilterChange()" class="filter-select">
                <option value="created_at">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>

            <!-- Search -->
            <div class="filter-group">
              <label>Search</label>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="onFilterChange()"
                placeholder="Search products..." 
                class="search-input"
              />
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="products-section">
          <div class="products-grid" *ngIf="!loading">
            <app-product-card 
              *ngFor="let product of products" 
              [product]="product"
            ></app-product-card>
          </div>

          <!-- Loading State -->
          <div class="loading-container" *ngIf="loading">
            <div class="loading-spinner"></div>
            <p>Loading products...</p>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="!loading && products.length === 0">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
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
            
            <span class="pagination-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <button 
              (click)="goToPage(currentPage + 1)" 
              [disabled]="currentPage === totalPages"
              class="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-page {
      padding: 2rem 0;
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filters-header h2 {
      margin: 0;
      color: #333;
    }

    .results-info {
      color: #666;
      font-size: 0.9rem;
    }

    .filters-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .filter-select,
    .search-input,
    .price-input {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .filter-select:focus,
    .search-input:focus,
    .price-input:focus {
      outline: none;
      border-color: #1976D2;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .price-input {
      flex: 1;
    }

    .products-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .loading-container {
      text-align: center;
      padding: 4rem 0;
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

    .empty-state {
      text-align: center;
      padding: 4rem 0;
      color: #666;
    }

    .empty-state h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .pagination-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #1565C0;
    }

    .pagination-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .pagination-info {
      font-weight: 600;
      color: #333;
    }

    @media (max-width: 768px) {
      .filters-container {
        grid-template-columns: 1fr;
      }

      .filters-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading: boolean = false;
  
  // Filters
  selectedCategory: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: string = 'created_at';
  searchQuery: string = '';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalProducts: number = 0;
  itemsPerPage: number = 12;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.searchQuery = params['search'] || '';
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.categories || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      category: this.selectedCategory,
      search: this.searchQuery,
      sortBy: this.sortBy,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    };

    this.productService.getProducts(
      params.page, 
      params.limit, 
      params.category, 
      params.search
    ).subscribe({
      next: (response: any) => {
        this.products = response.products || [];
        this.totalProducts = response.pagination?.total || 0;
        this.totalPages = response.pagination?.pages || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }
}