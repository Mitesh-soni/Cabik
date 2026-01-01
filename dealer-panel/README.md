# CABIK Dealer Panel

A comprehensive dealer management portal for CABIK vehicle sales platform. Dealers can upload vehicles, manage inventory, track sales analytics, and manage their business profile.

## Features

✨ **Core Features:**
- 🔐 Dealer Authentication & Login
- 📊 Analytics Dashboard with sales graphs
- 🚗 Vehicle Management (Add, Edit, Delete)
- 📈 Sales & Revenue Tracking
- 💼 Business Profile Management
- 🏦 Bank Details & Payment Setup
- 🔒 Security Settings & Password Management
- 📱 Fully Responsive Design

## Tech Stack

- **Frontend Framework:** React 18.2
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** React Icons
- **Build Tool:** Vite
- **Styling:** CSS3 with modern layouts

## Project Structure

```
dealer-panel/
├── src/
│   ├── pages/
│   │   ├── Login/              # Dealer login page
│   │   │   ├── DealerLogin.jsx
│   │   │   └── DealerLogin.css
│   │   ├── Dashboard/          # Main dashboard with stats
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   ├── Vehicles/           # Vehicle CRUD management
│   │   │   ├── VehicleManagement.jsx
│   │   │   └── VehicleManagement.css
│   │   ├── Analytics/          # Sales analytics & graphs
│   │   │   ├── Analytics.jsx
│   │   │   └── Analytics.css
│   │   └── Settings/           # Profile & security settings
│   │       ├── Settings.jsx
│   │       └── Settings.css
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   └── Navbar.css
│   ├── contexts/
│   │   └── DealerContext.jsx   # Auth state management
│   ├── api/
│   │   └── dealerApi.js        # API integration
│   ├── App.jsx                 # Main app with routes
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Navigate to dealer-panel directory:**
   ```bash
   cd dealer-panel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Access the Application

- **Development:** http://localhost:5174
- **Login with test credentials:**
  - Email: `dealer@cabik.com`
  - Password: `password123`

## API Endpoints Used

The dealer panel integrates with the following backend services:

### Authentication
- `POST /dealers/login` - Dealer login
- `GET /dealers/profile` - Get dealer profile

### Vehicle Management
- `POST /dealers/vehicles` - Upload new vehicle
- `GET /dealers/:id/vehicles` - Get dealer's vehicles
- `PUT /dealers/vehicles/:id` - Update vehicle details
- `DELETE /dealers/vehicles/:id` - Delete vehicle

### Analytics & Reports
- `GET /dealers/:id/analytics` - Get sales analytics data
- `GET /dealers/:id/revenue` - Get revenue data
- `GET /dealers/:id/orders` - Get dealer's orders
- `GET /dealers/:id/sales-report` - Generate sales report

## Features Detailed

### 1. **Dealer Login**
- Email and password validation
- Error handling with user-friendly messages
- Password visibility toggle
- Session management with JWT tokens

### 2. **Dashboard**
- Real-time statistics cards (Total Vehicles, Orders, Revenue)
- Quick action buttons
- Recent activity feed
- Performance metrics

### 3. **Vehicle Management**
- Upload vehicles with detailed information:
  - Brand, Model, Variant
  - Fuel Type, Transmission, Seating
  - Engine CC, Mileage, Launch Year
  - Price, Description
- Image upload support
- Edit & Delete functionality
- Search and filter options

### 4. **Analytics**
- Line chart for sales trends
- Bar chart for revenue overview
- Pie chart for sales by category
- Summary statistics
- Recent orders table

### 5. **Settings**
- **Profile Information:** Update business name, contact details, address
- **Business Details:** Manage GSTIN and PAN numbers
- **Bank Details:** Secure bank account information
- **Security:** Change password, 2FA setup, session management

## Styling & Design

The dealer panel uses a modern gradient color scheme:
- **Primary Color:** #667eea (Purple)
- **Secondary Color:** #764ba2 (Dark Purple)
- **Accent Color:** #f59e0b (Orange)
- **Success Color:** #10b981 (Green)
- **Background:** Linear gradient (Light blue to light purple)

### Responsive Design
- Mobile-first approach
- Responsive grids and flexbox layouts
- Touch-friendly button sizes
- Optimized for all screen sizes

## Authentication & Security

- JWT token-based authentication
- Secure token storage in localStorage
- Protected routes with ProtectedRoute component
- Automatic logout on token expiration
- Password encryption recommendations
- Session management

## State Management

Uses React Context API for managing:
- Dealer authentication state
- User session
- Authorization tokens
- Dealer profile data

## File Upload

Supports vehicle image uploads with:
- File type validation (jpg, png, gif)
- File size limits
- Preview functionality
- Multiple image support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port 5174 already in use
```bash
# Change port in vite.config.js or use:
npm run dev -- --port 5175
```

### Dependencies not installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

### CORS Issues
Ensure the backend API allows requests from `http://localhost:5174`

## Performance Optimization

- Code splitting with lazy loading
- Image optimization
- CSS minification
- Chart data caching
- Debounced API calls

## Future Enhancements

- 📲 Mobile app version
- 🔔 Push notifications
- 📧 Email notifications
- 📄 PDF report generation
- 🗺️ Map integration for location tracking
- 🤖 AI-powered pricing recommendations
- 💬 Real-time chat with customers
- 📱 WhatsApp integration

## Contributing

For contributing to the dealer panel, please follow the project's coding standards and submit pull requests to the main repository.

## Support

For issues or questions, please contact:
- Email: support@cabik.com
- Phone: +91-XXXXX-XXXXX

## License

Copyright © 2024 CABIK. All rights reserved.

---

**Happy Selling! 🚗**
