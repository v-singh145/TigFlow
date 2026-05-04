# 🚀 GigFlow - Freelance Marketplace Platform

A modern, real-time freelance marketplace platform built with **React**, **Node.js**, and **MongoDB**. GigFlow enables users to post gigs, bid on projects, and connect with freelancers—all with a beautiful dark-themed UI and atomic transaction support for race-condition-free hiring.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Core Features Explained](#core-features-explained)
  - [Atomic Hiring System](#atomic-hiring-system)
  - [Modern Dark UI](#modern-dark-ui)
  - [Real-time Updates](#real-time-updates)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)

---

## 📌 Overview

**GigFlow** is a full-stack freelance marketplace that solves critical race condition problems in concurrent hiring scenarios. When multiple administrators click "Hire" simultaneously on different freelancers for the same project, the system ensures only ONE bid gets hired—preventing data corruption and maintaining data integrity.

- ✅ **Atomic hiring** using MongoDB transactions
- ✅ **Beautiful dark theme** UI with gradients and animations
- ✅ **Real-time notifications** via Socket.io
- ✅ **Race condition prevention** for concurrent operations
- ✅ **Responsive design** for all devices
- ✅ **User authentication** and authorization
- ✅ **Gig management** (create, view, edit)
- ✅ **Bidding system** with atomic updates

---

## 🎯 Key Features

### 🔐 Atomic Hiring System
- **MongoDB Transactions**: Prevents race conditions in hiring
- **Critical Check**: Verifies gig status is "open" before hiring
- **Atomic Updates**: Updates Bid, Gig, and related records in a single transaction
- **Rollback Support**: Automatically rolls back on failure
- **Error Handling**: Specific error codes for debugging

### 🎨 Modern Dark UI
- **Dark Gradient Backgrounds**: Slate-900 and slate-800 color schemes
- **Animated Components**: Hover effects, spin loaders, scale transformations
- **Gradient Accents**: Blue, cyan, purple, and red gradients
- **Colored Shadow Glows**: Enhanced visual depth
- **Responsive Grid**: Mobile, tablet, and desktop optimized

### ⚡ Real-time Features
- **Socket.io Integration**: Live notifications for gig updates
- **Redux State Management**: Centralized state handling
- **Instant Feedback**: Users see changes immediately
- **Status Updates**: Real-time gig status changes

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI library with hooks
- **Vite 4.5.14** - Fast build tool and dev server
- **Tailwind CSS 3.3.0** - Utility-first styling
- **Redux Toolkit** - State management
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Node.js v22.18.0** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time server
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

### DevTools
- **ESLint** - Code linting
- **npm** - Package management

---

## 📁 Project Structure

```
Gigflow/
├── frontend/                      # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── GigsPage.jsx      # Main marketplace (dark theme)
│   │   │   ├── CreateGigPage.jsx # Post new gig (dark theme)
│   │   │   ├── GigDetailPage.jsx # Single gig details
│   │   │   ├── AuthPage.jsx      # Login/signup (dark theme)
│   │   │   └── HistoryPage.jsx   # User history
│   │   ├── components/
│   │   │   ├── GigCard.jsx       # Gig card component (dark theme)
│   │   │   ├── NotificationBell.jsx
│   │   │   └── NotificationBanner.jsx
│   │   ├── redux/
│   │   │   ├── gigsSlice.js
│   │   │   ├── authSlice.js
│   │   │   └── store.js
│   │   ├── services/
│   │   │   └── api.js            # Axios configuration
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Express application
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Gig.js                # Gig schema (includes hiredBidId, hiredAt)
│   │   └── Bid.js                # Bid schema (includes hiredAt)
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── gigs.js               # Gig CRUD endpoints
│   │   └── bids.js               # Bid endpoints (atomic hire)
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── server.js                 # Express server setup
│   ├── socket.js                 # Socket.io handlers
│   ├── .env.example              # Environment variables template
│   └── package.json
│
└── README.md                      # This file

```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v20+ and **npm** v9+
- **MongoDB** instance (local or Atlas)
- **Git**

### 1. Clone Repository
```bash
cd Desktop/Gigflow
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigflow
# JWT_SECRET=your-secret-key
# PORT=5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Vite will automatically use http://localhost:5000 for API calls
```

---

## ▶️ Running the Application

### Terminal 1: Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Terminal 2: Frontend Dev Server
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Access Application
Open browser and navigate to: **http://localhost:5173**

---

## 🎯 Core Features Explained

### 🔒 Atomic Hiring System

**Problem**: When two admins click "Hire" simultaneously for different freelancers on the same gig:
- Without atomicity: Both hires succeed, corrupting data
- With atomicity: Only one hire succeeds, the other is prevented

**Solution**: MongoDB Transactions

**Implementation** (`routes/bids.js`):
```javascript
const session = await mongoose.startSession()
session.startTransaction()

try {
  // 1. Verify gig status is OPEN
  const gig = await Gig.findById(gigId).session(session)
  if (gig.status !== 'open') {
    await session.abortTransaction()
    return res.status(400).json({ code: 'GIG_NOT_OPEN' })
  }

  // 2. Update bid (hire it)
  await Bid.updateOne({ _id: bidId }, { hiredAt: new Date() }, { session })

  // 3. Update gig (mark as closed)
  await Gig.updateOne(
    { _id: gigId },
    { status: 'assigned', hiredBidId: bidId, hiredAt: new Date() },
    { session }
  )

  // 4. Reject other bids atomically
  await Bid.updateMany(
    { gigId, _id: { $ne: bidId } },
    { status: 'rejected' },
    { session }
  )

  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
} finally {
  await session.endSession()
}
```

**Key Advantages**:
- ✅ All-or-nothing: Either the entire hire succeeds or nothing changes
- ✅ No partial updates: Prevents data inconsistency
- ✅ Automatic rollback: On error, all changes are undone
- ✅ Concurrent safe: Multiple simultaneous requests handled correctly

---

### 🎨 Modern Dark UI

**Design System**:
- **Background**: Gradient from slate-900 → slate-800 → slate-900
- **Cards**: Dark gradient (slate-700 to slate-800) with borders
- **Buttons**: 
  - Primary: Blue gradient (blue-500 to blue-600)
  - Secondary: Slate gradient
  - Destructive: Red gradient
- **Text**: White (text-white) or slate-300
- **Accents**: 
  - Success: Green-400 to emerald-500
  - Info: Blue-400 to cyan-400
  - Warning: Red-500 to red-600
  - Secondary: Purple-500 to purple-600

**Pages Updated**:

1. **GigsPage.jsx** - Main marketplace
   - Dark gradient background
   - Navigation with backdrop blur
   - Hero section with search
   - Animated loading state
   - Responsive gigs grid

2. **CreateGigPage.jsx** - Post new gig
   - Dark form with gradient backgrounds
   - Styled input fields with focus states
   - Currency emoji icon on budget
   - Animated submit button

3. **AuthPage.jsx** - Login/signup
   - Animated background glows
   - Gradient borders on card
   - Styled form inputs
   - Error message styling

4. **GigCard.jsx** - Gig card component
   - Gradient card background
   - Hover scale effect (105%)
   - Status badges with gradients
   - Colored shadow glows
   - Smooth transitions

**Animations**:
- Hover: `transform hover:scale-105`
- Loading: Spinning loader with `animate-spin`
- Focus: Ring effects with `focus:ring-2`
- Transitions: Smooth 200ms duration

---

### ⚡ Real-time Updates

**Socket.io Events**:

**Client → Server**:
- `join-room` - Join gig notifications room
- `hire-bid` - Emit when hiring a bid

**Server → Client**:
- `gig-updated` - Gig status changed
- `bid-accepted` - Bid was hired
- `gig-closed` - No more bids accepted
- `notification` - General notification

**Redux Integration**:
- State synchronized with Socket.io events
- Automatic UI updates on changes
- Redux slices for gigs, auth, bids

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Create new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

### Gigs
```
GET    /api/gigs             - Get all gigs
POST   /api/gigs             - Create new gig
GET    /api/gigs/:id         - Get single gig
PUT    /api/gigs/:id         - Update gig
DELETE /api/gigs/:id         - Delete gig
```

### Bids
```
GET    /api/gigs/:id/bids    - Get gig bids
POST   /api/gigs/:id/bids    - Create new bid
PUT    /api/bids/:id/hire    - ATOMIC HIRE BID
DELETE /api/bids/:id         - Delete bid
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ('user' | 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

### Gig Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  budget: Number,
  status: String ('open' | 'assigned' | 'completed'),
  createdBy: ObjectId (ref: User),
  hiredBidId: ObjectId (ref: Bid),
  hiredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Bid Model
```javascript
{
  _id: ObjectId,
  gigId: ObjectId (ref: Gig),
  userId: ObjectId (ref: User),
  bidAmount: Number,
  status: String ('pending' | 'accepted' | 'rejected'),
  hiredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔍 How Atomic Hiring Works

### Scenario: Two Admins Hire Simultaneously

**Timeline**:
```
Time 0ms   → Admin A clicks "Hire" for Freelancer X
Time 0ms   → Admin B clicks "Hire" for Freelancer Y
           (Both requests hit server at same time)

Time 1ms   → Transaction 1 starts (Admin A)
Time 1ms   → Transaction 2 starts (Admin B)

Time 2ms   → Transaction 1: Verify gig.status === 'open' ✓
Time 2ms   → Transaction 2: Verify gig.status === 'open' ✓

Time 3ms   → Transaction 1: Lock gig record (write lock)
Time 3ms   → Transaction 2: Wait for lock...

Time 4ms   → Transaction 1: Update gig to 'assigned'
Time 4ms   → Transaction 1: Commit ✓

Time 5ms   → Transaction 2: Acquire lock
Time 5ms   → Transaction 2: Verify gig.status === 'open' ✗
Time 5ms   → Transaction 2: ABORT (Rollback) ✗

Result: Only Admin A's hire succeeds. Admin B gets error: "GIG_NOT_OPEN"
```

---

## 🧪 Testing the System

### Test Atomic Hiring
```bash
# Open two browser windows, login as two different users
# On same gig, click "Hire" in both windows simultaneously
# Expected: Only one succeeds, other gets "GIG_NOT_OPEN" error
```

### Test Real-time Updates
```bash
# Open two browser windows
# Create a gig in one window
# Watch it appear instantly in the other window
```

### Test UI Responsiveness
```bash
# Resize browser window
# Grid should adapt: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
```

---

## 📚 Documentation Files

The project includes comprehensive documentation:
- `QUICK_REFERENCE.md` - 5-minute overview
- `IMPLEMENTATION_SUMMARY.md` - Complete feature documentation
- `ATOMIC_HIRING_LOGIC.md` - Technical deep-dive
- `RACE_CONDITION_VISUALIZATION.md` - Visual timelines
- `CODE_FLOW_DIAGRAMS.md` - Execution flow diagrams
- `TESTING_GUIDE.md` - 6 test scenarios
- `DOCUMENTATION_INDEX.md` - Navigation guide

---

## 🐛 Troubleshooting

### Frontend won't connect to backend
```bash
# Check backend is running on port 5000
# Check VITE_API_URL in frontend .env
# Check CORS settings in backend server.js
```

### MongoDB connection error
```bash
# Verify MONGO_URI in .env
# Check MongoDB service is running
# Ensure IP whitelist on MongoDB Atlas
```

### Socket.io not working
```bash
# Check socket connection in browser console
# Verify Socket.io running on same port as backend
# Check CORS settings for Socket.io
```

---

## 📝 Development Notes

### Adding New Features
1. Create backend API endpoint in `routes/`
2. Add MongoDB transaction if updating multiple documents
3. Create Redux slice in `redux/`
4. Build React component in `pages/` or `components/`
5. Style with Tailwind CSS (use dark theme colors)
6. Test for race conditions if applicable

### Color Palette
```
Dark Mode Colors:
- Background: slate-900, slate-800, slate-700
- Text: white, slate-300, slate-400
- Primary: blue-400, blue-500, blue-600
- Secondary: purple-500, purple-600
- Success: green-400, emerald-500
- Danger: red-500, red-600
- Cyan: cyan-400
```

---

## 🚀 Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Review and rating system
- [ ] Freelancer profiles with portfolio
- [ ] Advanced search and filtering
- [ ] Gig categories and tags
- [ ] Message/chat system
- [ ] Gig completion workflow
- [ ] Admin dashboard
- [ ] Analytics and metrics
- [ ] Email notifications

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## 👤 Author

**GigFlow Development Team**

For questions or support, refer to the project documentation files.

---

**Last Updated**: January 11, 2026 | **Version**: 1.0.0
