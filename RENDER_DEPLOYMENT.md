# Bookstore Project - Render.com Deployment Guide

## 📋 Prerequisites

1. **MongoDB Atlas Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Push your code to GitHub

## 🚀 Deployment Steps

### Step 1: Set Up MongoDB Atlas

1. Create a new cluster in MongoDB Atlas
2. Create a database user with a secure password
3. Whitelist all IP addresses (0.0.0.0/0) for Render access
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/bookstore`)

### Step 2: Deploy Backend on Render

1. **Go to Render Dashboard** → Click "New +" → Select "Web Service"

2. **Connect your GitHub repository**

3. **Configure the service**:
   - **Name**: `bookstore-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   SMTP_FROM=your_email@gmail.com
   SMTP_SECURE=false
   CLIENT_URL=https://your-frontend-url.onrender.com
   SEED_CATEGORIES=true
   ```

5. **Click "Create Web Service"**

6. **Note your backend URL**: It will be something like `https://bookstore-backend.onrender.com`

### Step 3: Deploy Frontend on Render

1. **Go to Render Dashboard** → Click "New +" → Select "Static Site"

2. **Connect your GitHub repository**

3. **Configure the service**:
   - **Name**: `bookstore-frontend` (or your preferred name)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   ```
   *(Replace with your actual backend URL from Step 2)*

5. **Click "Create Static Site"**

6. **Note your frontend URL**: It will be something like `https://bookstore-frontend.onrender.com`

### Step 4: Update Backend Environment

1. Go back to your **backend service** on Render
2. Update the `CLIENT_URL` environment variable with your actual frontend URL
3. Save changes (this will trigger a redeploy)

## 🔧 Important Configuration Notes

### Backend Changes Made:
- ✅ Added CORS configuration for production
- ✅ Updated server to listen on `0.0.0.0` for Render
- ✅ Removed hardcoded IP addresses
- ✅ Added environment-based configuration

### Frontend Changes Made:
- ✅ Updated Vite config for production builds
- ✅ Added `.env.production` for production environment variables
- ✅ Configured proxy to use environment variables

### Gmail SMTP Setup (for email features):

1. Go to your Google Account → Security
2. Enable 2-Factor Authentication
3. Generate an "App Password" for your application
4. Use this App Password in `SMTP_PASS` environment variable

## 📝 After Deployment

### Test Your Application:

1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/`
   - Should show: "Server is running..."

2. **Frontend**: Visit `https://your-frontend-url.onrender.com/`
   - Application should load and be able to fetch data from backend

### Common Issues:

1. **CORS Errors**: Make sure `CLIENT_URL` in backend matches your frontend URL exactly
2. **Database Connection**: Verify MongoDB connection string and IP whitelist
3. **First Load Slow**: Render free tier spins down after inactivity (takes ~30s to wake up)
4. **Environment Variables**: Double-check all env vars are set correctly

## 🔄 Updating Your Application

When you push changes to GitHub:
- Render will automatically detect and redeploy
- Backend: Redeploys on push to `main` branch
- Frontend: Rebuilds on push to `main` branch

## 💰 Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- 750 hours/month for web services
- Static sites are always available
- Database connections may need retry logic

## 🆘 Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify environment variables are set correctly
3. Test database connection string separately
4. Check CORS configuration if frontend can't reach backend

## 🎉 Success!

Your bookstore application should now be live and accessible from anywhere in the world!

**Frontend URL**: `https://your-frontend-url.onrender.com`
**Backend URL**: `https://your-backend-url.onrender.com`
