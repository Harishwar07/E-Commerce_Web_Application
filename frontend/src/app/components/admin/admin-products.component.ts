import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-products">
      <div class="container">
        <div class="header">
          <h1>Product Management</h1>
          <button (click)="showAddForm = true" class="add-btn">Add New Product</button>
        </div>

        <!-- Add/Edit Product Form -->
        <div class="product-form" *ngIf="showAddForm || editingProduct">
          <h3>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h3>
          <form (ngSubmit)="saveProduct()">
            <div class="form-row">
              <div class="form-group">
                <label>Product Name</label>
                <input type="text" [(ngModel)]="productForm.name" name="name" required class="form-control">
              </div>
              <div class="form-group">
                <label>Price</label>
                <input type="number" [(ngModel)]="productForm.price" name="price" required class="form-control" step="0.01">
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="productForm.description" name="description" required class="form-control" rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Category</label>
                <select [(ngModel)]="productForm.category_id" name="category_id" required class="form-control">
                  <option value="">Select Category</option>
                  <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Stock Quantity</label>
                <input type="number" [(ngModel)]="productForm.stock_quantity" name="stock_quantity" required class="form-control">
              </div>
            </div>

            <div class="form-group">
              <label>Image URL</label>
              <input type="url" [(ngModel)]="productForm.image_url" name="image_url" required class="form-control">
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="productForm.is_featured" name="is_featured">
                Featured Product
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn" [disabled]="saving">
                {{ saving ? 'Saving...' : (editingProduct ? 'Update' : 'Add') }} Product
              </button>
              <button type="button" (click)="cancelForm()" class="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Products List -->
        <div class="products-list">
          <div class="search-bar">
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="loadProducts()" placeholder="Search products..." class="search-input">
            <button (click)="loadProducts()" class="search-btn">Search</button>
          </div>

          <div class="products-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of products">
                  <td>
                    <img [src]="product.image_url" [alt]="product.name" class="product-image">
                  </td>
                  <td>{{ product.name }}</td>
                  <td>{{ product.category_name }}</td>
                  <td>\${{ product.price }}</td>
                  <td>
                    <span class="stock-badge" [ngClass]="getStockClass(product.stock_quantity)">
                      {{ product.stock_quantity }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="product.is_featured" class="featured-badge">⭐</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button (click)="editProduct(product)" class="edit-btn">Edit</button>
                      <button (click)="updateStock(product)" class="stock-btn">Stock</button>
                      <button (click)="deleteProduct(product.id)" class="delete-btn">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1" class="pagination-btn">Previous</button>
            <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages" class="pagination-btn">Next</button>
          </div>
        </div>

        <!-- Stock Update Modal -->
        <div class="modal" *ngIf="showStockModal" (click)="closeStockModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>Update Stock for {{ selectedProduct?.name }}</h3>
            <div class="form-group">
              <label>New Stock Quantity</label>
              <input type="number" [(ngModel)]="newStock" class="form-control" min="0">
            </div>
            <div class="modal-actions">
              <button (click)="saveStock()" class="save-btn">Update Stock</button>
              <button (click)="closeStockModal()" class="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-products {
      padding: 2rem 0;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .add-btn {
      background: #4caf50;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .add-btn:hover {
      background: #45a049;
    }

    .product-form {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .product-form h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
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
    }

    .form-control:focus {
      outline: none;
      border-color: #1976D2;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    .save-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .save-btn:hover:not(:disabled) {
      background: #1565C0;
    }

    .save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .cancel-btn {
      background: #666;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .cancel-btn:hover {
      background: #555;
    }

    .products-list {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .search-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
    }

    .search-btn {
      background: #1976D2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .products-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .product-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 6px;
    }

    .stock-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .stock-badge.high {
      background: #d4edda;
      color: #155724;
    }

    .stock-badge.medium {
      background: #fff3cd;
      color: #856404;
    }

    .stock-badge.low {
      background: #f8d7da;
      color: #721c24;
    }

    .featured-badge {
      font-size: 1.2rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .edit-btn, .stock-btn, .delete-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .edit-btn {
      background: #1976D2;
      color: white;
    }

    .stock-btn {
      background: #ff9800;
      color: white;
    }

    .delete-btn {
      background: #f44336;
      color: white;
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
    }

    .pagination-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .modal {
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

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  showAddForm = false;
  editingProduct: any = null;
  saving = false;
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;
  
  showStockModal = false;
  selectedProduct: any = null;
  newStock = 0;

  productForm = {
    name: '',
    description: '',
    price: 0,
    category_id: '',
    image_url: '',
    stock_quantity: 0,
    is_featured: false
  };

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

    // Listen for real-time product updates
    this.socketService.onProductUpdate().subscribe(data => {
      if (data.type === 'created' || data.type === 'updated') {
        this.loadProducts();
      } else if (data.type === 'deleted') {
        this.products = this.products.filter(p => p.id !== data.productId);
      }
    });

    this.socketService.onStockUpdate().subscribe(data => {
      const product = this.products.find(p => p.id === data.productId);
      if (product) {
        product.stock_quantity = data.newStock;
      }
    });
  }

  loadProducts(): void {
    const params = new URLSearchParams({
      page: this.currentPage.toString(),
      limit: '20'
    });

    if (this.searchQuery) {
      params.append('search', this.searchQuery);
    }

    this.http.get<any>(`http://localhost:3000/api/admin/products?${params}`).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalPages = response.pagination.pages;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadCategories(): void {
    this.http.get<any>('http://localhost:3000/api/products/categories').subscribe({
      next: (response) => {
        this.categories = response.categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  saveProduct(): void {
    this.saving = true;
    const url = this.editingProduct 
      ? `http://localhost:3000/api/admin/products/${this.editingProduct.id}`
      : 'http://localhost:3000/api/admin/products';
    
    const method = this.editingProduct ? 'put' : 'post';

    (this.http[method] as any)(url, this.productForm).subscribe({
      next: (response:any) => {
        this.saving = false;
        this.notificationService.addNotification({
          type: 'success',
          title: 'Success',
          message: (response as any).message
        });
        this.cancelForm();
        this.loadProducts();
      },
      error: (error:any) => {
        this.saving = false;
        this.notificationService.addNotification({
          type: 'error',
          title: 'Error',
          message: error.error?.message || 'Failed to save product'
        });
      }
    });
  }

  editProduct(product: any): void {
    this.editingProduct = product;
    this.productForm = { ...product };
    this.showAddForm = false;
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingProduct = null;
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      image_url: '',
      stock_quantity: 0,
      is_featured: false
    };
  }

  updateStock(product: any): void {
    this.selectedProduct = product;
    this.newStock = product.stock_quantity;
    this.showStockModal = true;
  }

  saveStock(): void {
    if (this.selectedProduct) {
      this.http.patch<any>(`http://localhost:3000/api/admin/products/${this.selectedProduct.id}/stock`, {
        stock_quantity: this.newStock
      }).subscribe({
        next: (response) => {
          this.notificationService.addNotification({
            type: 'success',
            title: 'Stock Updated',
            message: response.message
          });
          this.closeStockModal();
        },
        error: (error) => {
          this.notificationService.addNotification({
            type: 'error',
            title: 'Error',
            message: error.error?.message || 'Failed to update stock'
          });
        }
      });
    }
  }

  closeStockModal(): void {
    this.showStockModal = false;
    this.selectedProduct = null;
    this.newStock = 0;
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete<any>(`http://localhost:3000/api/admin/products/${id}`).subscribe({
        next: (response) => {
          this.notificationService.addNotification({
            type: 'success',
            title: 'Product Deleted',
            message: response.message
          });
          this.loadProducts();
        },
        error: (error) => {
          this.notificationService.addNotification({
            type: 'error',
            title: 'Error',
            message: error.error?.message || 'Failed to delete product'
          });
        }
      });
    }
  }

  getStockClass(stock: number): string {
    if (stock > 20) return 'high';
    if (stock > 5) return 'medium';
    return 'low';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }
}