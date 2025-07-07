import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="home">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1>Welcome to ShopZone</h1>
            <p>Discover millions of products at unbeatable prices</p>
            <button class="cta-button" routerLink="/products">Shop Now</button>
          </div>
          <div class="hero-image">
            <img src="https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Shopping" />
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories">
        <div class="container">
          <h2>Shop by Category</h2>
          <div class="categories-grid">
            <div *ngFor="let category of categories" class="category-card">
              <div class="category-image">
                <img [src]="category.image" [alt]="category.name" />
              </div>
              <h3>{{ category.name }}</h3>
              <a [routerLink]="['/products']" [queryParams]="{category: category.name}" class="category-link">
                Explore {{ category.name }}
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-products">
        <div class="container">
          <h2>Featured Products</h2>
          <div class="products-grid">
            <app-product-card 
              *ngFor="let product of featuredProducts" 
              [product]="product"
            ></app-product-card>
          </div>
        </div>
      </section>

      <!-- Deals Section -->
      <section class="deals">
        <div class="container">
          <div class="deals-content">
            <div class="deals-text">
              <h2>Daily Deals</h2>
              <p>Get up to 50% off on selected items</p>
              <button class="deals-button" routerLink="/products">View All Deals</button>
            </div>
            <div class="deals-image">
              <img src="https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Deals" />
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home {
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 0;
      min-height: 60vh;
      display: flex;
      align-items: center;
    }

    .hero .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .hero-content p {
      font-size: 1.3rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-button {
      background: #FF9800;
      color: white;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      border-radius: 50px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .cta-button:hover {
      background: #F57C00;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255,152,0,0.3);
    }

    .hero-image img {
      width: 100%;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    /* Categories Section */
    .categories {
      padding: 4rem 0;
      background: #f8f9fa;
    }

    .categories h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: #333;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .category-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
      text-align: center;
    }

    .category-card:hover {
      transform: translateY(-5px);
    }

    .category-image {
      height: 200px;
      overflow: hidden;
    }

    .category-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .category-card h3 {
      padding: 1rem;
      margin: 0;
      font-size: 1.3rem;
      color: #333;
    }

    .category-link {
      display: inline-block;
      margin: 0 0 1.5rem 0;
      color: #1976D2;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
    }

    .category-link:hover {
      color: #1565C0;
    }

    /* Featured Products */
    .featured-products {
      padding: 4rem 0;
    }

    .featured-products h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: #333;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    /* Deals Section */
    .deals {
      padding: 4rem 0;
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      color: white;
    }

    .deals-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .deals-text h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .deals-text p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .deals-button {
      background: white;
      color: #FF9800;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      border-radius: 50px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .deals-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255,255,255,0.3);
    }

    .deals-image img {
      width: 100%;
      border-radius: 15px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero .container {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-content h1 {
        font-size: 2rem;
      }

      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .deals-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  categories: Category[] = [
    {
      id: 1,
      name: 'Electronics',
      image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 2,
      name: 'Fashion',
      image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 3,
      name: 'Home & Garden',
      image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: 4,
      name: 'Sports',
      image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    // Mock data for featured products
    this.featuredProducts = [
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium quality wireless headphones with noise cancellation',
        price: 99.99,
        image: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Electronics',
        rating: 4.5,
        reviews: [],
        stock: 15,
        brand: 'TechSound'
      },
      {
        id: 2,
        name: 'Smart Watch Series 5',
        description: 'Advanced fitness tracking and smart features',
        price: 299.99,
        image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Electronics',
        rating: 4.7,
        reviews: [],
        stock: 8,
        brand: 'SmartTech'
      },
      {
        id: 3,
        name: 'Premium Coffee Maker',
        description: 'Brew perfect coffee every time with this premium machine',
        price: 149.99,
        image: 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Home & Garden',
        rating: 4.3,
        reviews: [],
        stock: 12,
        brand: 'BrewMaster'
      },
      {
        id: 4,
        name: 'Yoga Mat Pro',
        description: 'Non-slip premium yoga mat for all your fitness needs',
        price: 49.99,
        image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Sports',
        rating: 4.6,
        reviews: [],
        stock: 25,
        brand: 'FitLife'
      }
    ];
  }
}