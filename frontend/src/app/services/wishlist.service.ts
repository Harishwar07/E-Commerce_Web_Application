import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist = this.wishlistSubject.asObservable();

  constructor(private notificationService: NotificationService) {
    this.loadWishlist();
  }

  public get wishlistValue(): Product[] {
    return this.wishlistSubject.value;
  }

  addToWishlist(product: Product): Observable<any> {
    const currentWishlist = this.wishlistValue;
    const existingIndex = currentWishlist.findIndex(item => item.id === product.id);
    
    if (existingIndex === -1) {
      const updatedWishlist = [...currentWishlist, product];
      this.wishlistSubject.next(updatedWishlist);
      this.saveToLocalStorage(updatedWishlist);
      
      this.notificationService.addNotification({
        type: 'success',
        title: 'Added to Wishlist',
        message: `${product.name} has been added to your wishlist`
      });
    } else {
      this.notificationService.addNotification({
        type: 'info',
        title: 'Already in Wishlist',
        message: `${product.name} is already in your wishlist`
      });
    }
    
    return of({ message: 'Added to wishlist' });
  }

  removeFromWishlist(productId: number): Observable<any> {
    const currentWishlist = this.wishlistValue;
    const updatedWishlist = currentWishlist.filter(item => item.id !== productId);
    
    this.wishlistSubject.next(updatedWishlist);
    this.saveToLocalStorage(updatedWishlist);
    
    this.notificationService.addNotification({
      type: 'success',
      title: 'Removed from Wishlist',
      message: 'Item has been removed from your wishlist'
    });
    
    return of({ message: 'Removed from wishlist' });
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistValue.some(item => item.id === productId);
  }

  clearWishlist(): Observable<any> {
    this.wishlistSubject.next([]);
    this.saveToLocalStorage([]);
    
    this.notificationService.addNotification({
      type: 'success',
      title: 'Wishlist Cleared',
      message: 'Your wishlist has been cleared'
    });
    
    return of({ message: 'Wishlist cleared' });
  }

  private loadWishlist(): void {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const wishlist = JSON.parse(savedWishlist);
        this.wishlistSubject.next(wishlist);
      } catch (error) {
        console.error('Error parsing saved wishlist:', error);
        this.wishlistSubject.next([]);
      }
    }
  }

  private saveToLocalStorage(wishlist: Product[]): void {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }

  getWishlistCount(): number {
    return this.wishlistValue.length;
  }
}