# Shopping Mall Backend API

Express.js REST API for the Shopping Mall e-commerce platform.

## Overview

This is the backend server for the Shopping Mall application, built with Express.js and MongoDB. It provides RESTful endpoints for user authentication, product management, and order processing.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS, body-parser

## Prerequisites

- Node.js v16 or higher
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root:
```env
MONGO_URI=mongodb://localhost:27017/shopping-mall
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on the port specified in `.env` (default: 5000)

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection setup
├── controllers/
│   ├── userController.js     # User auth & management
│   ├── productController.js  # Product CRUD operations
│   └── orderController.js    # Order management
├── models/
│   ├── User.js              # User schema (admin, boutique, acheteur)
│   ├── Product.js           # Product schema with reviews
│   └── Order.js             # Order schema
├── routes/
│   ├── userRoutes.js        # /api/users endpoints
│   ├── productRoutes.js     # /api/products endpoints
│   └── orderRoutes.js       # /api/orders endpoints
├── middleware/
│   └── auth.js              # JWT verification & authorization
├── server.js                # Application entry point
├── package.json
├── .env                     # Environment variables (not in git)
└── README.md
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "acheteur" // or "boutique"
}

Response: 201 Created
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "acheteur"
  }
}
```

#### Login
```
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### Get Profile
```
GET /users/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "acheteur"
}
```

### User Management (Admin Only)

#### Get All Users
```
GET /users
Authorization: Bearer <admin_token>
```

#### Update User
```
PUT /users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "boutique"
}
```

#### Delete User
```
DELETE /users/:id
Authorization: Bearer <admin_token>
```

### Product Endpoints

#### Get All Products
```
GET /products?category=Fashion&minPrice=10&maxPrice=100&search=shirt

Query Parameters:
- category: Filter by category
- shop: Filter by shop ID
- search: Search in name and description
- minPrice: Minimum price filter
- maxPrice: Maximum price filter
```

#### Get Product by ID
```
GET /products/:id
```

#### Get Products by Shop
```
GET /products/shop/:shopId
```

#### Create Product (Boutique/Admin Only)
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "price": 29.99,
  "stock": 100,
  "description": "Product description",
  "image": "image-url",
  "category": "Fashion"
}
```

#### Update Product
```
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 39.99,
  "stock": 50
}
```

#### Delete Product
```
DELETE /products/:id
Authorization: Bearer <token>
```

#### Add Review
```
POST /products/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Great product!",
  "rating": 5
}
```

### Order Endpoints

#### Create Order
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

#### Get My Orders (Buyer)
```
GET /orders/my-orders
Authorization: Bearer <token>
```

#### Get Shop Orders (Shop Owner)
```
GET /orders/shop/orders
Authorization: Bearer <boutique_token>
```

#### Get Order by ID
```
GET /orders/:id
Authorization: Bearer <token>
```

#### Update Order Status
```
PUT /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped" // pending, confirmed, shipped, delivered, cancelled
}
```

#### Update Payment Status
```
PUT /orders/:id/payment-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "completed" // pending, completed, failed
}
```

#### Get All Orders (Admin Only)
```
GET /orders
Authorization: Bearer <admin_token>
```

#### Delete Order (Admin Only)
```
DELETE /orders/:id
Authorization: Bearer <admin_token>
```

## Error Handling

All errors are returned in the following format:

```json
{
  "message": "Error description"
}
```

Status codes:
- `400`: Bad Request
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Users receive a token upon login/signup
2. Token should be included in the `Authorization` header: `Bearer <token>`
3. Token expires in 7 days
4. Each route checks token validity and user role

## User Roles

### Admin
- Manage all users
- Manage all products
- View all orders
- Modify order statuses

### Boutique (Shop Owner)
- Create and manage own products
- View orders for own products
- Update order status for own orders

### Acheteur (Buyer)
- View all products
- Create orders
- View own orders
- Add reviews to products

## Database Connection

The application connects to MongoDB using Mongoose. Connection string is specified in the `MONGO_URI` environment variable.

## CORS Configuration

CORS is enabled to allow requests from the frontend. Configure allowed origins in production.

## Security Notes

- Never commit `.env` files with sensitive data
- Always use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for production
- Validate and sanitize all user inputs
- Use environment variables for sensitive configuration

## Development

### Adding New Routes

1. Create a new controller in `controllers/`
2. Create routes in `routes/`
3. Import and use in `server.js`

### Adding New Models

1. Create schema in `models/`
2. Update related controllers
3. Add corresponding routes

## Testing

(Add testing setup instructions when tests are implemented)

```bash
npm test
```

## Deployment

1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible from your server
3. Run `npm start` or configure your hosting to run it

Recommended hosting platforms:
- Heroku
- Railway
- Render
- AWS
- Google Cloud

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env`
- Verify network connectivity

### JWT Errors
- Token may have expired (need to re-login)
- Secret key may be incorrect
- Check token format in Authorization header

### CORS Errors
- Ensure frontend URL is allowed
- Check CORS configuration

## Author

RAJAONARISON Andry Misandratra Fiderana

## License

Part of M1P13MEAN University Assignment