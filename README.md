# Live Bid - Real-Time Auction Platform

A high-performance, real-time bidding application built to demonstrate **concurrency handling**, **socket synchronization**, and **premium UI design**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18%2B-green.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

---

## 🚀 Key Features

### 1. Backend (Node.js & Socket.io)
- **Real-Time Synchronization**: Instant bid updates broadcasted to all connected clients.
- **Race Condition Handling**: Uses Node.js's single-threaded event loop to guarantee atomic bid processing. If two users bid for the same amount at the exact same millisecond, the first request processed wins; the second is rejected with a clear error.
- **Persistent Sessions**: Custom authentication via `localStorage` ensures user identities (e.g., "User 1") remain stable across page reloads and re-connections.

### 2. Frontend (React)
- **Live Countdown**: Timer synced with server time to prevent client-side manipulation.
- **Premium UI**: 
  - Glassmorphism aesthetic with high-contrast gradients.
  - "Jewel-like" status badges (Winning/Outbid) with glow effects.
  - Micro-interactions and flash animations for real-time feedback.
- **Multi-User Context**: Visual indicators explicitly show "Outbid by User X" or "Won by User Y".

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: React, Vite, Advanced Vanilla CSS (Variables, Gradients, Animations)
- **Containerization**: Docker, Docker Compose

---

## 🏃‍♂️ How to Run

### Option 1: Docker (Recommended)
The easiest way to start the entire stack.

```bash
# 1. Build and start services
docker-compose up --build

# 2. Open your browser
# Visit http://localhost:5173
```

### Option 2: Local Development (Manual)
If you prefer running without Docker.

**1. Start Backend**
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3001
```

**2. Start Frontend**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🧪 Testing Guide

### 1. Simulating Multiple Users
1. Open the app in **Tab A**. You will be assigned "User 1".
2. Open the app in **Tab B** using **Incognito Mode** (or a different browser).
   - *Note*: Since we use `localStorage` for persistence, opening a normal new tab will treat you as the same user. Incognito creates a fresh session.
3. **Action**: Place a bid in Tab A.
   - **Tab A** sees: Green "Winning" badge.
   - **Tab B** instantly sees: Red "Outbid by User 1" badge.

### 2. Verifying Race Conditions
Since it's hard to manually click at the exact same millisecond, you can verify the logic by reviewing the server logs or `store.js`.
- **Logic**: The server checks `if (newBid <= currentBid)` *synchronously* before updating the state.
- **Test**: If User 1 and User 2 both try to bid $110:
    1. Server processes User 1: Price updates to $110.
    2. Server processes User 2: Checks Price ($110). New Bid ($110) is not higher. Request Rejected.

### 3. Testing Session Persistence
1. Note your identity (e.g., "User 1").
2. Refresh the page.
3. Verify you are **still "User 1"** and not a new user.
4. Restart the server (`docker-compose restart backend`).
5. Refresh. You should reclaimed your "User 1" identity (based on connection order/persistence).

---

## 📂 Project Structure

```
Bidding-app/
├── backend/
│   ├── src/
│   │   ├── server.js      # Entry point
│   │   ├── sockets.js     # Real-time event handlers
│   │   ├── store.js       # In-memory database & Logic
│   │   ├── routes.js      # REST endpoints
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # AuctionCard, Dashboard, etc.
│   │   ├── App.jsx        # Main Socket connection logic
│   │   └── index.css      # Premium Styles
│   └── Dockerfile
└── docker-compose.yml
```



