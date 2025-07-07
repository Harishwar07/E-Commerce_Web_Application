import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:3000/api/products';

  // Mock products data with Indian Rupee prices
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium quality wireless headphones with active noise cancellation and 30-hour battery life',
      price: 16499.99,
      image: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.5,
      reviews: [],
      stock: 25,
      brand: 'AudioTech'
    },
    {
      id: 2,
      name: 'Smart Watch Series 5',
      description: 'Advanced fitness tracking, heart rate monitoring, and smart notifications',
      price: 24799.99,
      image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.7,
      reviews: [],
      stock: 15,
      brand: 'TechWear'
    },
    {
      id: 3,
      name: 'Premium Coffee Maker',
      description: 'Programmable coffee maker with built-in grinder and thermal carafe',
      price: 12399.99,
      image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Home & Garden',
      rating: 4.3,
      reviews: [],
      stock: 30,
      brand: 'BrewMaster'
    },
    {
      id: 4,
      name: 'Yoga Mat Pro',
      description: 'Non-slip premium yoga mat with alignment guides and carrying strap',
      price: 4149.99,
      image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Sports',
      rating: 4.6,
      reviews: [],
      stock: 50,
      brand: 'FitLife'
    },
    {
      id: 5,
      name: 'Laptop Ultrabook 15"',
      description: 'High-performance laptop with Intel i7 processor, 16GB RAM, and 512GB SSD',
      price: 107499.99,
      image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.8,
      reviews: [],
      stock: 8,
      brand: 'TechBook'
    },
    {
      id: 6,
      name: 'Designer T-Shirt',
      description: 'Premium cotton t-shirt with modern design and comfortable fit',
      price: 2499.99,
      image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Clothing',
      rating: 4.2,
      reviews: [],
      stock: 100,
      brand: 'StyleCo'
    },
    {
      id: 7,
      name: 'Running Shoes Pro',
      description: 'Professional running shoes with advanced cushioning and breathable mesh',
      price: 10749.99,
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Sports',
      rating: 4.6,
      reviews: [],
      stock: 40,
      brand: 'RunFast'
    },
    {
      id: 8,
      name: 'Smartphone Pro Max',
      description: 'Latest flagship smartphone with triple camera system and 5G connectivity',
      price: 82699.99,
      image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.9,
      reviews: [],
      stock: 12,
      brand: 'PhoneTech'
    },
    {
      id: 9,
      name: 'Gaming Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard with customizable keys and macro support',
      price: 7449.99,
      image: 'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.4,
      reviews: [],
      stock: 35,
      brand: 'GameGear'
    },
    {
      id: 10,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking and long battery life',
      price: 3309.99,
      image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.1,
      reviews: [],
      stock: 60,
      brand: 'ClickTech'
    },
    {
      id: 11,
      name: 'Denim Jeans Classic',
      description: 'Classic fit denim jeans made from premium cotton with comfortable stretch',
      price: 6619.99,
      image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Clothing',
      rating: 4.3,
      reviews: [],
      stock: 75,
      brand: 'DenimCo'
    },
    {
      id: 12,
      name: 'Fitness Tracker Band',
      description: 'Waterproof fitness tracker with heart rate monitoring and sleep tracking',
      price: 6619.99,
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Sports',
      rating: 4.2,
      reviews: [],
      stock: 45,
      brand: 'FitTrack'
    },
    {
      id: 13,
      name: 'Cookbook Collection',
      description: 'Set of 3 bestselling cookbooks featuring international cuisine recipes',
      price: 4149.99,
      image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Books',
      rating: 4.8,
      reviews: [],
      stock: 20,
      brand: 'CookMaster'
    },
    {
      id: 14,
      name: 'Wireless Earbuds',
      description: 'True wireless earbuds with noise cancellation and wireless charging case',
      price: 13229.99,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.5,
      reviews: [],
      stock: 28,
      brand: 'SoundPro'
    },
    {
      id: 15,
      name: 'Home Security Camera',
      description: '1080p HD security camera with night vision and mobile app control',
      price: 9919.99,
      image: 'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Electronics',
      rating: 4.4,
      reviews: [],
      stock: 22,
      brand: 'SecureTech'
    },
    {
      id: 16,
      name: 'Backpack Travel Pro',
      description: 'Durable travel backpack with multiple compartments and laptop sleeve',
      price: 7449.99,
      image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Travel',
      rating: 4.6,
      reviews: [],
      stock: 33,
      brand: 'TravelGear'
    }
  ];

  private mockCategories: Category[] = [
    { id: 1, name: 'Electronics', image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 2, name: 'Clothing', image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 3, name: 'Home & Garden', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 4, name: 'Sports', image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 5, name: 'Books', image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 6, name: 'Travel', image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=300' }
  ];

  constructor(private http: HttpClient) {}

  getProducts(page: number = 1, limit: number = 20, category?: string, search?: string): Observable<{products: Product[], pagination: any}> {
    // Filter products based on category and search
    let filteredProducts = [...this.mockProducts];
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(filteredProducts.length / limit);

    return of({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        pages: totalPages
      }
    });
  }

  getProduct(id: number): Observable<Product> {
    const product = this.mockProducts.find(p => p.id === id);
    return of(product!);
  }

  getCategories(): Observable<{categories: Category[]}> {
    return of({ categories: this.mockCategories });
  }

  getFeaturedProducts(): Observable<Product[]> {
    // Return products with rating >= 4.5 as featured
    const featuredProducts = this.mockProducts.filter(p => p.rating >= 4.5).slice(0, 8);
    return of(featuredProducts);
  }

  searchProducts(query: string): Observable<Product[]> {
    const searchLower = query.toLowerCase();
    const results = this.mockProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower)
    );
    return of(results);
  }
}