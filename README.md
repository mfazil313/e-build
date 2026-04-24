# Construction Materials Marketplace - BuildMart

A comprehensive Next.js web application connecting suppliers, customers, and drivers for construction materials procurement and delivery.

![BuildMart](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Overview

BuildMart is a three-sided marketplace platform that optimizes the construction materials supply chain by:
- **Suppliers**: Manage inventory, process orders, track payments
- **Customers**: Browse materials, compare prices, order with delivery
- **Drivers**: Accept delivery jobs, navigate routes, earn money

Based on comprehensive flow analysis identifying and solving **15+ friction points** across all user journeys.

## ✨ Features

### For Suppliers 🏭
- ✅ Multi-step registration with GST verification
- 📦 Product catalog management with bulk upload
- 📋 Real-time order notifications and one-tap acceptance
- 💰 Transparent payment settlement with instant payout options
- 📊 Analytics dashboard with revenue tracking

### For Customers 🏗️
- 🔍 Smart search with category filters
- ⚖️ Compare up to 3 suppliers side-by-side
- 🛒 Shopping cart with delivery options (Tempo/Self-pickup)
- 💳 Multiple payment methods (UPI, Cards, COD)
- 📍 Live GPS order tracking with ETA

### For Drivers 🚚
- 📋 Job feed with payment and distance details
- 🗺️ Turn-by-turn navigation with simulated GPS
- 📸 Digital proof of delivery (photo + signature)
- 💵 Instant wallet updates and flexible withdrawals
- 📊 Earnings dashboard (daily/weekly/monthly)

## 🚀 Getting Started

### Prerequisites

Since Node.js is not currently installed on your system, you'll need to:

1. **Install Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

### Installation

Once Node.js is installed:

```bash
# Navigate to project directory
cd C:\Users\mfazi\.gemini\antigravity\scratch\construction_marketplace

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at **http://localhost:3000**

## 📁 Project Structure

```
construction_marketplace/
├── pages/
│   ├── index.js          # Landing page with role selection
│   ├── supplier.js       # Supplier dashboard
│   ├── customer.js       # Customer interface
│   ├── driver.js         # Driver app
│   ├── _app.js           # Next.js app wrapper
│   └── _document.js      # HTML document wrapper
├── styles/
│   ├── globals.css       # Global design system
│   ├── Home.module.css   # Landing page styles
│   ├── Supplier.module.css
│   ├── Customer.module.css
│   └── Driver.module.css
├── lib/
│   └── mockData.js       # Mock data & helper functions
├── package.json
└── next.config.js
```

## 🎨 Design System

- **Colors**: Primary (Blue), Secondary (Purple), Success/Warning/Danger
- **Typography**: Inter (UI), Outfit (Headings)
- **Components**: Buttons, Cards, Badges, Inputs with consistent styling
- **Animations**: Smooth transitions, micro-interactions, pulse effects
- **Responsive**: Mobile-first design with breakpoints

## 🔄 User Flows

### Supplier Flow
1. Register → Upload docs → Get verified
2. Add products → Set pricing → Manage inventory
3. Receive orders → Accept/Decline → Mark ready
4. Track payments → Withdraw funds

**Optimizations**: Auto GST verification, bulk product upload, one-tap order acceptance

### Customer Flow
1. Browse materials → Filter/Search
2. Compare suppliers → Select best option
3. Add to cart → Choose delivery method
4. Checkout → Make payment
5. Track order → Receive materials

**Optimizations**: Side-by-side comparison, total cost calculator, live GPS tracking

### Driver Flow
1. Register → Verify documents
2. View available jobs → Check route preview
3. Accept job → Navigate to pickup
4. Load materials → Deliver to customer
5. Get signature → Complete delivery → Receive payment

**Optimizations**: Instant verification, vehicle matching, waiting time compensation

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2
- **UI Library**: React 18.3
- **Styling**: CSS Modules with Custom Properties
- **Icons**: React Icons
- **State**: React useState/Context
- **Data**: Mock data (simulated API)

## 📱 Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with role selection |
| `/supplier` | Supplier dashboard |
| `/customer` | Customer browsing & ordering |
| `/driver` | Driver job feed & delivery |

## 💾 Mock Data

The app uses comprehensive mock data including:
- **Products**: Cement, Steel, Bricks, Sand (with realistic pricing)
- **Suppliers**: 3 verified suppliers with ratings
- **Orders**: Sample orders with different statuses
- **Driver Jobs**: Available delivery jobs with coordinates
- **Profiles**: Complete supplier, customer, and driver profiles

## 🔮 Future Enhancements

### Backend Integration
- [ ] Node.js/Express API
- [ ] PostgreSQL database
- [ ] JWT authentication
- [ ] Real-time WebSockets

### Features
- [ ] Google Maps integration for real navigation
- [ ] Razorpay/Stripe payment gateway
- [ ] SMS/Email notifications (Twilio)
- [ ] Review & rating system
- [ ] Admin dashboard
- [ ] Analytics & reporting

### Mobile Apps
- [ ] React Native iOS/Android apps
- [ ] Push notifications
- [ ] Offline mode

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👤 Author

Created as a comprehensive marketplace demo showcasing modern web development practices.

---

## 🎯 Quick Navigation

**Start Here**:
1. Visit `/` (landing page)
2. Choose your role: Supplier | Customer | Driver
3. Explore the full workflow

**Test Accounts** (Mock Data):
- Supplier: Delhi Cement Supplies
- Customer: Rajesh Construction  
- Driver: Vikram Singh

---

Built with ❤️ using Next.js
# e-build
# e-build
