# LUXE - E-Commerce Platform

A premium e-commerce platform with a full frontend and backend, featuring product browsing, shopping cart, user authentication, and checkout.

## Features

- 16 curated products across 7 categories
- Product filtering by category, price range, and search
- Sorting by price, rating, and name
- Sliding cart sidebar with quantity controls
- Product detail modal with reviews and recommendations
- JWT-based authentication (register/login/logout)
- User account page with order history
- Checkout flow with shipping and payment forms
- Admin statistics endpoint
- Newsletter signup
- Sale banner with countdown timer
- Social proof popups and toast notifications
- Wishlist functionality
- Stock level indicators
- Free shipping progress bar
- Exit intent popup
- Fully responsive (mobile-first)
- Preloader animation
- Particle effects background

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Database:** JSON file-based storage
- **Dependencies:** express, cors, bcryptjs, jsonwebtoken, uuid

## Installation

```bash
npm install
```

## Usage

```bash
npm start
# or
npm run dev
```

The server runs on `http://localhost:3001`.

## API Endpoints

- `POST /api/register` - Create account
- `POST /api/login` - Authenticate user
- `GET /api/products` - List products
- `POST /api/orders` - Place order
- `GET /api/admin/stats` - Admin statistics

## Categories

Electronics, Accessories, Shoes, Home, Beauty, Fitness, Clothing
