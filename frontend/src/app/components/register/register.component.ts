import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h2>Create Account</h2>
          <p>Join ShopZone today</p>
        </div>

        <form (ngSubmit)="onRegister()" class="register-form" #registerForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                [(ngModel)]="firstName" 
                name="firstName"
                required
                minlength="2"
                maxlength="50"
                pattern="[a-zA-Z]+"
                #firstNameInput="ngModel"
                class="form-control"
                [class.error]="firstNameInput.invalid && firstNameInput.touched"
                placeholder="Enter your first name"
                (blur)="validateFirstName()"
              />
              <div class="validation-messages" *ngIf="firstNameInput.invalid && firstNameInput.touched">
                <small class="error-text" *ngIf="firstNameInput.errors?.['required']">
                  First name is required
                </small>
                <small class="error-text" *ngIf="firstNameInput.errors?.['minlength']">
                  First name must be at least 2 characters
                </small>
                <small class="error-text" *ngIf="firstNameInput.errors?.['pattern']">
                  First name can only contain letters
                </small>
              </div>
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                [(ngModel)]="lastName" 
                name="lastName"
                required
                minlength="2"
                maxlength="50"
                pattern="[a-zA-Z]+"
                #lastNameInput="ngModel"
                class="form-control"
                [class.error]="lastNameInput.invalid && lastNameInput.touched"
                placeholder="Enter your last name"
                (blur)="validateLastName()"
              />
              <div class="validation-messages" *ngIf="lastNameInput.invalid && lastNameInput.touched">
                <small class="error-text" *ngIf="lastNameInput.errors?.['required']">
                  Last name is required
                </small>
                <small class="error-text" *ngIf="lastNameInput.errors?.['minlength']">
                  Last name must be at least 2 characters
                </small>
                <small class="error-text" *ngIf="lastNameInput.errors?.['pattern']">
                  Last name can only contain letters
                </small>
              </div>
            </div>
          </div>

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
            <label for="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              [(ngModel)]="phone" 
              name="phone"
              pattern="[0-9+\-\s\(\)]+"
              #phoneInput="ngModel"
              class="form-control"
              [class.error]="phoneInput.invalid && phoneInput.touched"
              placeholder="Enter your phone number"
              (blur)="validatePhone()"
            />
            <div class="validation-messages" *ngIf="phoneInput.invalid && phoneInput.touched">
              <small class="error-text" *ngIf="phoneInput.errors?.['pattern']">
                Please enter a valid phone number
              </small>
            </div>
            <div class="validation-messages" *ngIf="phoneValidationError">
              <small class="error-text">{{ phoneValidationError }}</small>
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
                placeholder="Create a password"
                (blur)="validatePassword()"
                (input)="checkPasswordStrength()"
              />
              <button 
                type="button" 
                class="password-toggle"
                (click)="togglePasswordVisibility()"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="password-strength" *ngIf="password">
              <div class="strength-bar">
                <div class="strength-fill" [ngClass]="passwordStrength.class" [style.width.%]="passwordStrength.score * 25"></div>
              </div>
              <small class="strength-text" [ngClass]="passwordStrength.class">
                {{ passwordStrength.text }}
              </small>
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
            <div class="password-requirements">
              <small>Password should contain:</small>
              <ul>
                <li [class.valid]="passwordChecks.length">At least 6 characters</li>
                <li [class.valid]="passwordChecks.uppercase">One uppercase letter</li>
                <li [class.valid]="passwordChecks.lowercase">One lowercase letter</li>
                <li [class.valid]="passwordChecks.number">One number</li>
                <li [class.valid]="passwordChecks.special">One special character</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="password-input-container">
              <input 
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword"
                required
                #confirmPasswordInput="ngModel"
                class="form-control"
                [class.error]="confirmPasswordInput.invalid && confirmPasswordInput.touched"
                placeholder="Confirm your password"
                (blur)="validateConfirmPassword()"
              />
              <button 
                type="button" 
                class="password-toggle"
                (click)="toggleConfirmPasswordVisibility()"
              >
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div class="validation-messages" *ngIf="confirmPasswordInput.invalid && confirmPasswordInput.touched">
              <small class="error-text" *ngIf="confirmPasswordInput.errors?.['required']">
                Please confirm your password
              </small>
            </div>
            <div class="validation-messages" *ngIf="confirmPasswordValidationError">
              <small class="error-text">{{ confirmPasswordValidationError }}</small>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="agreeToTerms" name="agreeToTerms" required />
              I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a>
            </label>
          </div>

          <button 
            type="submit" 
            class="register-button" 
            [disabled]="loading || !agreeToTerms || registerForm.invalid || !isFormValid()"
          >
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading">Creating Account...</span>
          </button>

          <div class="register-footer">
            <p>Already have an account? <a routerLink="/login">Sign in</a></p>
          </div>
        </form>

        <div class="error-message" *ngIf="error">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .register-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-header h2 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .register-header p {
      color: #666;
      font-size: 1rem;
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

    .password-strength {
      margin-top: 0.5rem;
    }

    .strength-bar {
      width: 100%;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.25rem;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .strength-fill.weak {
      background: #f44336;
    }

    .strength-fill.fair {
      background: #ff9800;
    }

    .strength-fill.good {
      background: #2196f3;
    }

    .strength-fill.strong {
      background: #4caf50;
    }

    .strength-text {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .strength-text.weak {
      color: #f44336;
    }

    .strength-text.fair {
      color: #ff9800;
    }

    .strength-text.good {
      color: #2196f3;
    }

    .strength-text.strong {
      color: #4caf50;
    }

    .password-requirements {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .password-requirements small {
      color: #666;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }

    .password-requirements ul {
      margin: 0;
      padding-left: 1rem;
      list-style: none;
    }

    .password-requirements li {
      font-size: 0.8rem;
      color: #999;
      margin-bottom: 0.25rem;
      position: relative;
    }

    .password-requirements li::before {
      content: '✗';
      color: #f44336;
      font-weight: bold;
      position: absolute;
      left: -1rem;
    }

    .password-requirements li.valid {
      color: #4caf50;
    }

    .password-requirements li.valid::before {
      content: '✓';
      color: #4caf50;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .terms-link {
      color: #1976D2;
      text-decoration: none;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    .register-button {
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

    .register-button:hover:not(:disabled) {
      background: #1565C0;
      transform: translateY(-2px);
    }

    .register-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .register-footer {
      text-align: center;
    }

    .register-footer p {
      color: #666;
      font-size: 0.9rem;
    }

    .register-footer a {
      color: #1976D2;
      text-decoration: none;
      font-weight: 600;
    }

    .register-footer a:hover {
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
      .register-card {
        padding: 2rem;
        margin: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeToTerms: boolean = false;
  loading: boolean = false;
  error: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Custom validation errors
  emailValidationError: string = '';
  passwordValidationError: string = '';
  confirmPasswordValidationError: string = '';
  phoneValidationError: string = '';

  // Password strength
  passwordStrength = {
    score: 0,
    text: '',
    class: ''
  };

  // Password requirements check
  passwordChecks = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validateFirstName(): void {
    if (this.firstName && !/^[a-zA-Z]+$/.test(this.firstName)) {
      // Additional validation handled by Angular form validation
    }
  }

  validateLastName(): void {
    if (this.lastName && !/^[a-zA-Z]+$/.test(this.lastName)) {
      // Additional validation handled by Angular form validation
    }
  }

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

    // Check for consecutive dots
    if (this.email.includes('..')) {
      this.emailValidationError = 'Email cannot contain consecutive dots';
      return;
    }

    // Check email length
    if (this.email.length > 254) {
      this.emailValidationError = 'Email address is too long';
      return;
    }

    // Check local part length (before @)
    const localPart = this.email.split('@')[0];
    if (localPart.length > 64) {
      this.emailValidationError = 'Email local part is too long';
      return;
    }

    // Check for valid characters
    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!validEmailRegex.test(this.email)) {
      this.emailValidationError = 'Email contains invalid characters';
    }
  }

  validatePhone(): void {
    this.phoneValidationError = '';
    
    if (!this.phone) {
      return; // Phone is optional
    }

    // Remove all non-digit characters for validation
    const digitsOnly = this.phone.replace(/\D/g, '');
    
    // Check length (should be between 10-15 digits)
    if (digitsOnly.length < 10) {
      this.phoneValidationError = 'Phone number must have at least 10 digits';
      return;
    }

    if (digitsOnly.length > 15) {
      this.phoneValidationError = 'Phone number cannot exceed 15 digits';
      return;
    }

    // Check for valid phone number pattern
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(digitsOnly)) {
      this.phoneValidationError = 'Please enter a valid phone number';
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
    const weakPasswords = ['123456', 'password', 'qwerty', 'abc123', '111111', 'password123', 'admin', 'letmein'];
    if (weakPasswords.includes(this.password.toLowerCase())) {
      this.passwordValidationError = 'Please choose a stronger password';
      return;
    }

    // Check for whitespace
    if (this.password.includes(' ')) {
      this.passwordValidationError = 'Password cannot contain spaces';
      return;
    }

    // Check if password contains email
    if (this.email && this.password.toLowerCase().includes(this.email.split('@')[0].toLowerCase())) {
      this.passwordValidationError = 'Password cannot contain your email';
      return;
    }

    // Check if password contains name
    if (this.firstName && this.password.toLowerCase().includes(this.firstName.toLowerCase())) {
      this.passwordValidationError = 'Password cannot contain your name';
      return;
    }
  }

  validateConfirmPassword(): void {
    this.confirmPasswordValidationError = '';
    
    if (!this.confirmPassword) {
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.confirmPasswordValidationError = 'Passwords do not match';
    }
  }

  checkPasswordStrength(): void {
    if (!this.password) {
      this.passwordStrength = { score: 0, text: '', class: '' };
      this.passwordChecks = {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      };
      return;
    }

    let score = 0;
    
    // Check requirements
    this.passwordChecks.length = this.password.length >= 6;
    this.passwordChecks.uppercase = /[A-Z]/.test(this.password);
    this.passwordChecks.lowercase = /[a-z]/.test(this.password);
    this.passwordChecks.number = /\d/.test(this.password);
    this.passwordChecks.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);

    // Calculate score
    if (this.passwordChecks.length) score++;
    if (this.passwordChecks.uppercase) score++;
    if (this.passwordChecks.lowercase) score++;
    if (this.passwordChecks.number) score++;
    if (this.passwordChecks.special) score++;

    // Additional points for length
    if (this.password.length >= 8) score += 0.5;
    if (this.password.length >= 12) score += 0.5;

    // Set strength
    if (score < 2) {
      this.passwordStrength = { score: 1, text: 'Weak', class: 'weak' };
    } else if (score < 3) {
      this.passwordStrength = { score: 2, text: 'Fair', class: 'fair' };
    } else if (score < 4) {
      this.passwordStrength = { score: 3, text: 'Good', class: 'good' };
    } else {
      this.passwordStrength = { score: 4, text: 'Strong', class: 'strong' };
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFormValid(): boolean {
    return ! !this.firstName && 
           ! !this.lastName && 
           ! !this.email && 
           ! !this.password && 
           ! !this.confirmPassword &&
           this.password === this.confirmPassword &&
           !this.emailValidationError && 
           !this.passwordValidationError && 
           !this.confirmPasswordValidationError &&
           !this.phoneValidationError &&
           this.firstName.length >= 2 &&
           this.lastName.length >= 2 &&
           this.password.length >= 6 &&
           this.agreeToTerms;
  }

  onRegister(): void {
    // Final validation before submission
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();
    this.validatePhone();

    if (!this.isFormValid()) {
      this.error = 'Please fix the validation errors above';
      return;
    }

    this.loading = true;
    this.error = '';

    const userData = {
      first_name: this.firstName.trim(),
      last_name: this.lastName.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      password: this.password
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }
}