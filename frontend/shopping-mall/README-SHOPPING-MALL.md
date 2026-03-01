# Shopping Mall Frontend - Angular Application

Modern and responsive Angular single-page application for the Shopping Mall e-commerce platform.

## Overview

This is the frontend of the Shopping Mall application, built with Angular and TypeScript. It provides a user-friendly interface for browsing products, managing accounts, and placing orders across multiple boutiques.

## Technology Stack

- **Framework**: Angular 18+ (Standalone Components)
- **Language**: TypeScript
- **Styling**: CSS3 with responsive design
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with lazy loading
- **Forms**: Reactive Forms & Template-driven Forms

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Angular CLI (optional but recommended)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend/shopping-mall
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Server
```bash
ng serve
# or
npm start
```

The application will open at `http://localhost:4200`

### Production Build
```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## Project Structure

```
shopping-mall/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.model.ts        # User interfaces
│   │   │   ├── product.model.ts     # Product interfaces
│   │   │   └── order.model.ts       # Order interfaces
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts      # Authentication service
│   │   │   ├── product.service.ts   # Product API service
│   │   │   ├── order.service.ts     # Order API service
│   │   │   └── auth.interceptor.ts  # JWT interceptor
│   │   │
│   │   ├── guards/
│   │   │   └── auth.guard.ts        # Route protection guard
│   │   │
│   │   ├── components/
│   │   │   ├── navbar/              # Navigation component
│   │   │   ├── footer/              # Footer component
│   │   │   ├── home/                # Home page
│   │   │   ├── auth/                # Login & signup
│   │   │   ├── products/            # Product listing & details
│   │   │   ├── orders/              # Order management
│   │   │   ├── boutique/            # Shop owner dashboard
│   │   │   ├── admin/               # Admin dashboard
│   │   │   └── profile/             # User profile
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts  # HTTP interceptor
│   │   │
│   │   ├── app.routes.ts            # Route configuration
│   │   ├── app.config.ts            # App configuration
│   │   ├── app.ts                   # Root component
│   │   └── app.css                  # Global styles
│   │
│   ├── index.html
│   ├── main.ts
│   ├── styles.css
│   └── favicon.ico
│
├── angular.json
├── tsconfig.json
├── package.json
└── README.md
```

## Key Features

### Authentication
- User registration with role selection (Buyer, Shop Owner)
- Secure login with JWT tokens
- Token stored in localStorage for persistence
- Auto-logout on token expiration
- Protected routes with AuthGuard

### Products
- Browse all products from multiple shops
- Search and filter products by:
  - Category
  - Price range
  - Shop
  - Text search
- View detailed product information
- Product ratings and reviews
- Stock availability status

### User Profiles
- View and manage account information
- Different dashboards for different roles:
  - **Admin**: User management, platform statistics
  - **Shop Owner**: Product management, order tracking
  - **Buyer**: Order history, saved items

### Orders
- Create orders with multiple items
- Select shipping address
- Choose payment method
- Track order status
- View order history

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface
- Optimized navigation for mobile

## Services

### AuthService
Handles user authentication and authorization:
- `signup()` - Register new user
- `login()` - Authenticate user
- `logout()` - Clear session
- `getProfile()` - Fetch user profile
- `isAuthenticated()` - Check login status
- `hasRole()` - Check user permissions

### ProductService
Manages product-related API calls:
- `getProducts()` - Fetch products with filters
- `getProductById()` - Get single product details
- `getProductsByShop()` - Get shop's products
- `createProduct()` - Add new product
- `updateProduct()` - Modify product
- `deleteProduct()` - Remove product
- `addReview()` - Submit product review

### OrderService
Handles order operations:
- `createOrder()` - Create new order
- `getMyOrders()` - Fetch user's orders
- `getShopOrders()` - Fetch shop's orders
- `getOrderById()` - Get order details
- `updateOrderStatus()` - Update order state
- `updatePaymentStatus()` - Update payment state
- `deleteOrder()` - Remove order (admin)

## Components

### Layout Components
- **Navbar**: Navigation with role-based menus
- **Footer**: Application footer with credits

### Page Components
- **Home**: Hero section and featured products
- **Products**: Product listing with filters
- **ProductDetail**: Detailed product view
- **Login**: User authentication form
- **Signup**: User registration form
- **Profile**: User account management
- **BuyerOrders**: Order history for buyers
- **BoutiqueDashboard**: Shop management interface
- **BoutiqueProducts**: Shop product management
- **AdminDashboard**: Admin control panel
- **AdminUsers**: User management interface

## Routing

Routes are protected with `AuthGuard` and role-based access control:

```
/                          # Home (public)
/login                     # Login (public)
/signup                    # Register (public)
/products                  # Product listing (public)
/products/:id              # Product details (public)
/profile                   # User profile (protected)
/buyer/orders              # Order history (protected - buyer)
/boutique/dashboard        # Shop dashboard (protected - boutique)
/boutique/products         # Shop products (protected - boutique)
/admin/dashboard           # Admin panel (protected - admin)
/admin/users               # User management (protected - admin)
```

## HTTP Interceptor

The `AuthInterceptor` automatically:
- Attaches JWT token to all outgoing requests
- Sets proper `Authorization: Bearer <token>` header
- Handles authentication errors gracefully

## Styling

### Theme Colors
- Primary: #667eea (Purple)
- Secondary: #764ba2 (Dark Purple)
- Success: #2ecc71 (Green)
- Error: #e74c3c (Red)
- Info: #3498db (Blue)

### Responsive Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

## API Configuration

The application connects to the backend API at:
```
http://localhost:5000/api
```

To change this, update the API URLs in the service files:
- `auth.service.ts`
- `product.service.ts`
- `order.service.ts`

## Form Validation

### Login Form
- Email: Required, valid format
- Password: Required, minimum 6 characters

### Signup Form
- Name: Required, minimum 3 characters
- Email: Required, valid format
- Password: Required, minimum 6 characters
- Confirm Password: Must match password
- Role: Required (Buyer or Shop Owner)

## State Management

The application uses:
- Angular Services with RxJS Observables
- BehaviorSubjects for state management
- localStorage for persistent authentication

Example:
```typescript
// Subscribe to current user
authService.currentUser$.subscribe(user => {
  this.currentUser = user;
});

// Get current value
const user = authService.currentUserValue;
```

## Error Handling

Application includes:
- HTTP error interception
- User-friendly error messages
- Form validation feedback
- API error responses

## Performance Optimization

- Lazy loading of routes
- Standalone components (reduced bundle size)
- OnPush change detection strategy
- Unsubscribe from observables on destroy

## Building for Production

1. Build the application:
```bash
ng build --configuration production
```

2. Deploy the `dist/shopping-mall` folder to your hosting platform

Recommended platforms:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Development Tips

### Adding a New Component
```bash
ng generate component components/my-component
```

### Adding a New Service
```bash
ng generate service services/my-service
```

### Running Tests
```bash
ng test
```

### Linting
```bash
ng lint
```

## Troubleshooting

### API Connection Issues
- Ensure backend server is running on port 5000
- Check CORS configuration in backend
- Verify API URLs in services

### Authentication Issues
- Clear localStorage and refresh
- Check JWT token expiration
- Verify backend JWT_SECRET matches

### Build Issues
- Delete `node_modules` and reinstall: `npm ci`
- Clear Angular cache: `rm -rf .angular`
- Check Node.js and npm versions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Environment Configuration

Create environment files for different configurations:

```typescript
// src/environments/environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

// src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Security Notes

- Never commit sensitive data
- Validate user input on both client and server
- Use HTTPS in production
- Implement Content Security Policy headers
- Keep dependencies up to date
- Review authentication logic regularly

## Performance Metrics

- Initial load time: ~3-5 seconds
- Time to interactive: ~5-7 seconds
- First contentful paint: ~2-3 seconds

Monitor and optimize as needed.

## Accessibility

- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast compliance
- Semantic HTML structure

## Author

RAJAONARISON Andry Misandratra Fiderana

## License

Part of M1P13MEAN University Assignment

## Support

For issues or questions, refer to the main README.md in the project root.