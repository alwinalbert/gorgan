# Backend-Frontend Integration Setup Guide

This guide will help you set up the integration between the backend (`servorgan`) and frontend (`demodet`).

## Prerequisites

- Node.js installed
- Firebase project created
- Firebase service account key file

## Backend Setup (servorgan)

### 1. Install Dependencies
```bash
cd servorgan
npm install
```

### 2. Configure Environment Variables
Create/update `.env` file in `servorgan` directory:
```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
GOOGLE_APPLICATION_CREDENTIALS=./keys/upisde-down-survival-firebase-adminsdk-fbsvc-bb1ac83d14.json
```

### 3. Firebase Service Account Key
- Place your Firebase Admin SDK key in `servorgan/keys/` directory
- The file is already configured: `upisde-down-survival-firebase-adminsdk-fbsvc-bb1ac83d14.json`

### 4. Start Backend Server
```bash
npm run dev
```

Server will run on `http://localhost:4000`

## Frontend Setup (demodet)

### 1. Install Dependencies
```bash
cd demodet
npm install
```

### 2. Configure Firebase Web App Credentials
Update `.env` file in `demodet` directory with your Firebase web app credentials:

```env
VITE_OPENWEATHER_API_KEY=36a96d122dad53d1b8f63bba925a9c0a

# Backend API URL
VITE_API_URL=http://localhost:4000

# Firebase Configuration - Get these from Firebase Console
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=upisde-down-survival
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**To get Firebase Web App credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `upisde-down-survival`
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. If no web app exists, click "Add app" and select Web
6. Copy the configuration values from `firebaseConfig` object

### 3. Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173` (or the port Vite assigns)

## Integration Features

### ✅ Implemented Features

1. **Authentication**
   - Anonymous sign-in via Firebase
   - Automatic user profile creation on backend
   - JWT token-based API authentication

2. **Real-time Communication**
   - Socket.IO connection between frontend and backend
   - Connection status indicator in header
   - Automatic reconnection handling

3. **Alert System**
   - Sensor data monitoring (Temperature, Sound, Air Quality)
   - Automatic threat level calculation
   - Backend alert creation when threat detected
   - Alert data includes sensor readings and timestamps

4. **API Integration**
   - User profile management
   - Alert creation and retrieval
   - Friend requests system (backend ready)
   - Health check endpoints

### 📡 API Endpoints

**Authentication Required:**
- `GET /api/users/me` - Get current user profile
- `POST /api/users/init` - Initialize user profile
- `PATCH /api/users/me` - Update user profile
- `POST /api/users/friends/request` - Send friend request
- `POST /api/users/friends/accept` - Accept friend request
- `POST /api/alerts` - Create new alert

**Public:**
- `GET /api/alerts?limit=20` - Get recent alerts
- `GET /health` - Server health check
- `GET /api/ping` - Simple ping test

### 🔌 Socket.IO Events

The Socket.IO connection is authenticated using Firebase JWT tokens. You can extend it with custom events:

```typescript
// Example: Listen for new alerts
socket.on('new-alert', (alert) => {
  console.log('New alert received:', alert);
});

// Example: Emit sensor data
socket.emit('sensor-update', { temperature, soundLevel, aqi });
```

## Testing the Integration

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd servorgan
npm run dev

# Terminal 2 - Frontend
cd demodet
npm run dev
```

### 2. Test Authentication
1. Open frontend in browser
2. Click "Sign In Anonymously"
3. Check browser console for successful authentication
4. Verify Socket.IO connection shows "ONLINE" in header

### 3. Test Alert System
1. Adjust sensor values in the dashboard
2. Trigger high values (temp > 30, sound > 80, or AQI > 200)
3. Check browser console for alert creation
4. Verify backend receives alert (check backend console)

### 4. Test API Endpoints
```bash
# Get alerts (no auth required)
curl http://localhost:4000/api/alerts

# Health check
curl http://localhost:4000/health
```

## Troubleshooting

### Backend won't start
- Check if port 4000 is available: `netstat -ano | findstr :4000`
- Kill process if needed: `taskkill //PID <pid> //F`
- Verify Firebase key file exists in `keys/` directory

### Frontend can't connect to backend
- Verify backend is running on port 4000
- Check CORS settings in backend `.env` file
- Ensure `VITE_API_URL` in frontend `.env` is correct

### Authentication fails
- Verify Firebase web credentials in frontend `.env`
- Check Firebase project ID matches
- Ensure Firebase Admin SDK key is valid
- Check browser console for detailed errors

### Socket.IO connection fails
- Verify user is authenticated first
- Check network tab for WebSocket connection
- Ensure backend allows CORS for frontend origin

## File Structure

### Backend (servorgan)
```
servorgan/
├── src/
│   ├── config/
│   │   └── firebaseAdmin.ts       # Firebase admin setup
│   ├── controllers/
│   │   └── userController.ts      # User management
│   ├── middleware/
│   │   └── verifyFirebaseToken.ts # Auth middleware
│   ├── routes/
│   │   ├── users.ts               # User routes
│   │   └── alerts.ts              # Alert routes
│   └── index.ts                   # Server entry point
├── keys/
│   └── [firebase-admin-key].json  # Firebase service account
├── package.json
└── .env
```

### Frontend (demodet)
```
demodet/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard (integrated)
│   │   ├── MessagingDashboard.tsx # Stranger Things messaging
│   │   └── [other components]
│   ├── context/
│   │   ├── AuthContext.tsx        # Authentication context
│   │   └── SensorContext.tsx      # Sensor data context
│   ├── hooks/
│   │   └── useSocket.ts           # Socket.IO hook
│   ├── services/
│   │   └── api.ts                 # API service layer
│   ├── config/
│   │   └── firebase.ts            # Firebase web config
│   └── App.tsx
├── package.json
└── .env
```

## Next Steps

1. **Add Real-time Alerts**: Implement Socket.IO events for broadcasting alerts to all connected users
2. **Friends System**: Complete the friend request UI in MessagingDashboard
3. **Alert History**: Create a component to display alert history from backend
4. **User Profiles**: Add user profile editing capabilities
5. **Notifications**: Implement browser notifications for critical threats

## Support

If you encounter issues, check:
1. Browser console for frontend errors
2. Backend terminal for server errors
3. Network tab for failed API requests
4. Firebase Console for authentication issues
