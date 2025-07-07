# ShopZone - Full-Stack E-commerce Application

A modern, responsive e-commerce platform built with Angular frontend and Node.js/Express backend, featuring MySQL database integration.

## 🚀 Features

### Frontend (Angular)
- **Modern UI/UX**: Clean, responsive design inspired by leading e-commerce platforms
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Add, remove, and manage items with real-time updates
- **User Authentication**: Secure login and registration system
- **Order Management**: Track orders and view order history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Backend (Node.js/Express)
- **RESTful API**: Well-structured API endpoints for all operations
- **Authentication**: JWT-based authentication with secure password hashing
- **Database Integration**: MySQL database with proper relationships
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Helmet, CORS, and rate limiting for security

### Database (MySQL)
- **Normalized Schema**: Proper database design with relationships
- **Sample Data**: Pre-populated with sample products and categories
- **Indexes**: Optimized queries with proper indexing
- **Data Integrity**: Foreign key constraints and validation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Angular CLI

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:4200`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=shopzone
   JWT_SECRET=your-secret-key
   ```

5. Create the MySQL database:
   ```sql
   CREATE DATABASE shopzone;
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will automatically create the required tables and populate them with sample data.

## 🏗️ Project Structure

### Frontend Structure
```
src/
├── app/
│   ├── components/          # UI components
│   ├── services/           # API services
│   ├── models/             # TypeScript interfaces
│   └── app.routes.ts       # Route configuration
├── global_styles.css       # Global styles
└── main.ts                 # Application bootstrap
```

### Backend Structure
```
backend/
├── config/                 # Configuration files
├── middleware/             # Custom middleware
├── routes/                 # API routes
├── uploads/               # File uploads
├── .env.example           # Environment variables template
└── server.js              # Main server file
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get all categories
- `GET /api/products/search` - Search products

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:id` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get specific order
- `PUT /api/orders/:id/status` - Update order status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

## 🎨 Design Features

- **Color Scheme**: Professional blue (#1976D2), green (#388E3C), and orange (#FF9800)
- **Typography**: Modern, readable fonts with proper hierarchy
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design with breakpoints
- **Accessibility**: WCAG compliant with proper focus management

## 🔧 Development

### Running Tests
```bash
# Frontend tests
ng test

# Backend tests
cd backend && npm test
```

### Building for Production
```bash
# Frontend build
ng build --prod

# Backend production mode
cd backend && npm start
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
