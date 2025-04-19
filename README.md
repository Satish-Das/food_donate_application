# Project React - Donation Management System

A comprehensive web application with React frontend and Express backend for donation management. This platform enables users to make donations, administrators to manage donations and users, and provides detailed analytics and reporting.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

This application serves as a donation management platform where:
- Users can register, log in, and make donations
- Administrators can manage users, track donations, and gain insights through analytics
- Donors can view their donation history and impact
- The platform provides a seamless experience across devices

## Project Structure

The project follows a client-server architecture with separate frontend and backend codebases:

### Backend Structure

```
Backend/
├── controllers/       # Request handlers for each route
├── database/          # Database connection setup
├── middlewares/       # Authentication and other middleware
├── models/            # Mongoose schema definitions
│   ├── adminModel.js  # Admin user schema
│   ├── userModel.js   # Regular user schema
│   └── donateModel.js # Donation schema
├── routes/            # API route definitions
│   ├── adminRoutes.js # Admin-specific endpoints
│   ├── userRoutes.js  # User-specific endpoints
│   └── donateRoute.js # Donation-related endpoints
├── scripts/           # Utility scripts
├── services/          # Business logic 
├── utils/             # Helper functions
│   ├── asyncHandler.js # Async error handling
│   └── errorHandler.js # Error response formatting
├── .env               # Environment variables
├── app.js             # Express application setup
├── server.js          # Server entry point
└── package.json       # Dependencies and scripts
```

### Frontend Structure

```
Frontend/
├── public/            # Static files
├── src/
│   ├── assets/        # Images and other assets
│   ├── components/    # Reusable UI components
│   ├── config/        # Configuration files
│   ├── pages/         # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Donate.jsx
│   │   └── ...
│   ├── routes/        # Routing configuration
│   │   ├── Routes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Entry point
├── .env               # Environment variables
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies and scripts
```

## Features

### User Management
- User registration with form validation
- Secure authentication using JWT
- User profile management
- Password reset functionality

### Admin Dashboard
- Comprehensive admin interface for site management
- User management (view, edit, delete users)
- Donation tracking and approval workflow
- Analytics and reporting with visual charts

### Donation System
- Multiple donation options
- Secure payment processing
- Donation history tracking
- Donation receipt generation

### Frontend Experience
- Responsive design works on mobile, tablet, and desktop
- Interactive UI with real-time updates
- Form validation and error handling
- Data visualization using Chart.js
- Toasts for notifications

## Technology Stack

### Frontend
- **React 18**: UI library
- **React Router 7**: For navigation and routing
- **Axios**: HTTP client for API requests
- **Chart.js & React-Chartjs-2**: For data visualization
- **React Icons**: For UI icons
- **React Toastify**: For toast notifications
- **Tailwind CSS 4**: For styling
- **Vite**: Build tool and development server

### Backend
- **Node.js**: JavaScript runtime
- **Express 5**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose 8**: MongoDB object modeling
- **JWT**: For authentication
- **Bcrypt**: For password hashing
- **Express Validator**: For request validation
- **Nodemon**: For development server auto-reload

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd project_react
```

2. Install Frontend dependencies
```bash
cd Frontend
npm install
```

3. Install Backend dependencies
```bash
cd Backend
npm install
```

4. Configure environment variables

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/donation_db
JWT_ACCESS_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRY=1d
JWT_REFRESH_EXPIRY=7d
```

Frontend (.env):
```
VITE_API_URL=http://localhost:5000
```

### Running the Application

1. Start MongoDB (if using local installation)
```bash
mongod
```

2. Start the Backend server
```bash
cd Backend
npm start
```

3. Start the Frontend development server
```bash
cd Frontend
npm run dev
```

4. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Documentation

### Authentication Endpoints

- **POST /admin/register** - Register new admin
- **POST /admin/login** - Admin login
- **POST /user/register** - Register new user
- **POST /user/login** - User login

### User Endpoints

- **GET /user/profile** - Get user profile
- **PUT /user/profile** - Update user profile
- **POST /user/forgot-password** - Request password reset

### Donation Endpoints

- **POST /donate** - Create new donation
- **GET /donate** - Get all donations
- **GET /donate/:id** - Get donation by ID
- **PUT /donate/:id** - Update donation status

### Admin Endpoints

- **GET /admin/users** - Get all users
- **GET /admin/donations** - Get all donations
- **PUT /admin/donations/:id** - Update donation status
- **DELETE /admin/users/:id** - Delete user

## Deployment

### Backend Deployment
1. Set up a MongoDB database (MongoDB Atlas recommended for production)
2. Deploy to a hosting service like Heroku, Render, or AWS:
   ```bash
   cd Backend
   # Configure production environment variables
   npm run build
   # Follow hosting service-specific deployment steps
   ```

### Frontend Deployment
1. Build the production version:
   ```bash
   cd Frontend
   npm run build
   ```
2. Deploy the generated `dist` folder to services like Vercel, Netlify, or AWS S3.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



---

© 2023 Project React. All Rights Reserved by Satish Das, Joshan kumar kushwaha, Rohit yadav. 