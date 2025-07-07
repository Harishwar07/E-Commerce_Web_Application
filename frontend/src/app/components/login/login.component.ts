import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email"
              required
              email
              #emailInput="ngModel"
              class="form-control"
              [class.error]="emailInput.invalid && emailInput.touched"
              placeholder="Enter your email"
              (blur)="validateEmail()"
            />
            <div class="validation-messages" *ngIf="emailInput.invalid && emailInput.touched">
              <small class="error-text" *ngIf="emailInput.errors?.['required']">
                Email is required
              </small>
              <small class="error-text" *ngIf="emailInput.errors?.['email']">
                Please enter a valid email address
              </small>
            </div>
            <div class="validation-messages" *ngIf="emailValidationError">
              <small class="error-text">{{ emailValidationError }}</small>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input-container">
              <input 
                [type]="showPassword ? 'text' : 'password'"
                id="password" 
                [(ngModel)]="password" 
                name="password"
                required
                minlength="6"
                #passwordInput="ngModel"
                class="form-control"
                [class.error]="passwordInput.invalid && passwordInput.touched"
                placeholder="Enter your password"
                (blur)="validatePassword()"
              />
              <button 
                type="button" 
                class="password-toggle"
                (click)="togglePasswordVisibility()"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="validation-messages" *ngIf="passwordInput.invalid && passwordInput.touched">
              <small class="error-text" *ngIf="passwordInput.errors?.['required']">
                Password is required
              </small>
              <small class="error-text" *ngIf="passwordInput.errors?.['minlength']">
                Password must be at least 6 characters long
              </small>
            </div>
            <div class="validation-messages" *ngIf="passwordValidationError">
              <small class="error-text">{{ passwordValidationError }}</small>
            </div>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
              Remember me
            </label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            class="login-button" 
            [disabled]="loading || loginForm.invalid || !isFormValid()"
          >
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Signing in...</span>
          </button>

          <div class="login-footer">
            <p>Don't have an account? <a routerLink="/register">Sign up</a></p>
          </div>
        </form>

        <div class="error-message" *ngIf="error">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h2 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .login-header p {
      color: #666;
      font-size: 1rem;
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

    .password-input-container {
      position: relative;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #1976D2;
    }

    .form-control.error {
      border-color: #f44336;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      color: #666;
    }

    .password-toggle:hover {
      color: #333;
    }

    .validation-messages {
      margin-top: 0.5rem;
    }

    .error-text {
      color: #f44336;
      font-size: 0.8rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .forgot-password {
      color: #1976D2;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .forgot-password:hover {
      text-decoration: underline;
    }

    .login-button {
      width: 100%;
      background: #1976D2;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;
    }

    .login-button:hover:not(:disabled) {
      background: #1565C0;
      transform: translateY(-2px);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .login-footer {
      text-align: center;
    }

    .login-footer p {
      color: #666;
      font-size: 0.9rem;
    }

    .login-footer a {
      color: #1976D2;
      text-decoration: none;
      font-weight: 600;
    }

    .login-footer a:hover {
      text-decoration: underline;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 1rem;
      border-radius: 10px;
      margin-top: 1rem;
      text-align: center;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 2rem;
        margin: 1rem;
      }
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loading: boolean = false;
  error: string = '';
  showPassword: boolean = false;
  
  // Custom validation errors
  emailValidationError: string = '';
  passwordValidationError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validateEmail(): void {
    this.emailValidationError = '';
    
    if (!this.email) {
      return;
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.emailValidationError = 'Please enter a valid email address';
      return;
    }

    // Check for common email providers
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const domain = this.email.split('@')[1]?.toLowerCase();
    
    if (domain && !commonDomains.includes(domain) && !domain.includes('.')) {
      this.emailValidationError = 'Please enter a valid email domain';
      return;
    }

    // Check for consecutive dots
    if (this.email.includes('..')) {
      this.emailValidationError = 'Email cannot contain consecutive dots';
      return;
    }

    // Check for valid characters
    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!validEmailRegex.test(this.email)) {
      this.emailValidationError = 'Email contains invalid characters';
    }
  }

  validatePassword(): void {
    this.passwordValidationError = '';
    
    if (!this.password) {
      return;
    }

    // Length validation
    if (this.password.length < 6) {
      this.passwordValidationError = 'Password must be at least 6 characters long';
      return;
    }

    if (this.password.length > 128) {
      this.passwordValidationError = 'Password cannot exceed 128 characters';
      return;
    }

    // Check for common weak passwords
    const weakPasswords = ['123456', 'password', 'qwerty', 'abc123', '111111', 'password123'];
    if (weakPasswords.includes(this.password.toLowerCase())) {
      this.passwordValidationError = 'Please choose a stronger password';
      return;
    }

    // Check for whitespace
    if (this.password.includes(' ')) {
      this.passwordValidationError = 'Password cannot contain spaces';
      return;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    return ! !this.email && 
           ! !this.password && 
           !this.emailValidationError && 
           !this.passwordValidationError &&
           this.email.length > 0 &&
           this.password.length >= 6;
  }

  onLogin(): void {
    // Final validation before submission
    this.validateEmail();
    this.validatePassword();

    if (!this.isFormValid()) {
      this.error = 'Please fix the validation errors above';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Invalid email or password';
        console.error('Login error:', error);
      }
    });
  }
}