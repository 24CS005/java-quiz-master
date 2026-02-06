# Java Quiz Master - Deployment Guide

## 🌐 Deployed Links

### Frontend (Vercel)
**Live URL:** https://java-quiz-master-orbd.vercel.app

### Backend Setup Required
The backend must be deployed separately to support WebSocket connections for real-time quiz features.

---

## 🚀 Quick Backend Deployment (Render)

### Option 1: One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/24CS005/java-quiz-master)

### Option 2: Manual Render Setup

1. **Create Render Account**
   - Go to https://render.com
   - Sign up or log in

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `24CS005/java-quiz-master`
   - Render will auto-detect the `render.yaml` configuration

3. **Configure Environment Variables** (Required)
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy your service URL (e.g., `https://java-quiz-backend.onrender.com`)

5. **Update Frontend**
   - Go to Vercel dashboard: https://vercel.com/dashboard
   - Select project: `java-quiz-master-orbd`
   - Go to Settings → Environment Variables
   - Add: `VITE_SOCKET_URL` = `https://your-backend-url.onrender.com`
   - Redeploy frontend

---

## 🔧 Alternative: Railway Deployment

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```

3. Set environment variables:
   ```bash
   railway variables set MONGODB_URI="your-mongodb-uri"
   railway variables set GEMINI_API_KEY="your-api-key"
   ```

4. Get your backend URL from Railway dashboard and update Vercel.

---

## 📋 Required Environment Variables

### Backend (.env in server/)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
GEMINI_API_KEY=your_gemini_api_key
PORT=10000
NODE_ENV=production
```

### Frontend (Vercel Environment Variables)
```env
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## ✅ Features Deployed

- ✅ 35-second countdown timer per question
- ✅ Real-time synchronization for host and students
- ✅ Time-based scoring (full points ≤10s, scales to 0 at 35s)
- ✅ 70-player session limit with error handling
- ✅ End-of-quiz leaderboard for all participants
- ✅ PDF upload for AI-generated questions (Gemini)
- ✅ Socket.io real-time multiplayer support

---

## 🔒 Security Note

Make sure to use the NEW credentials (rotate the exposed ones):
- MongoDB Atlas credentials
- Gemini API key
- Supabase credentials

---

## 🧪 Testing the Deployment

1. Open frontend: https://java-quiz-master-orbd.vercel.app
2. Create a quiz session as host
3. Join from another browser/device as student
4. Verify timer synchronization and real-time updates

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs: https://vercel.com/dashboard
2. Check Render service logs: https://dashboard.render.com
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas allows connections from any IP (0.0.0.0/0)
