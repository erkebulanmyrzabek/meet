# Deployment Guide for Render.com

This guide explains how to deploy your video call application to Render.com.

## 🚀 Start Command for Render.com

**IMPORTANT:** Use this exact command in the "Start Command" field:

```bash
daphne -b 0.0.0.0 -p $PORT backend.asgi:application
```

**Why Daphne instead of Gunicorn?**
- Your app uses WebSockets for video call signaling
- Gunicorn doesn't support WebSockets natively
- Daphne is an ASGI server that handles both HTTP and WebSocket connections

![Render Start Command](uploaded_image_1768565451646.png)

## 📋 Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Add Render.com deployment configuration"
git push origin main
```

### 2. Create a New Web Service on Render.com

1. Go to [Render.com Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `erkebulanmyrzabek/meet`

### 3. Configure the Web Service

**Basic Settings:**
- **Name:** `meet-backend` (or your preferred name)
- **Runtime:** `Python 3`
- **Build Command:** `./build.sh`
- **Start Command:** `daphne -b 0.0.0.0 -p $PORT backend.asgi:application`

**Environment Variables:**
Click "Advanced" → "Add Environment Variable" and add:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.12.0` |
| `SECRET_KEY` | Click "Generate" for a secure random key |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Your frontend URL (e.g., `https://meet-frontend.onrender.com`) |

### 4. Add Redis (for WebSocket Channels)

1. Go to "New +" → "Redis"
2. **Name:** `meet-redis`
3. **Plan:** Free or Starter
4. After creation, copy the Redis URL

5. Add to your backend environment variables:
   - **Key:** `REDIS_URL`
   - **Value:** The Redis connection URL from step 4

### 5. Update Channel Layers Configuration

The app will automatically use Redis in production. Update `backend/settings.py` if needed:

```python
# In settings.py, update CHANNEL_LAYERS:
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [os.getenv('REDIS_URL', 'redis://localhost:6379')],
        },
    },
}
```

### 6. Deploy Frontend to Render

**Option 1: Static Site**
1. Click "New +" → "Static Site"
2. Connect your repository
3. **Build Command:** `cd frontend && npm install && npm run build`
4. **Publish Directory:** `frontend/dist`

**Option 2: Use Vercel/Netlify**
Frontend can be deployed separately on Vercel or Netlify for better performance.

## 🔧 Post-Deployment Configuration

### Update Frontend API URLs

In `frontend/src/config.js`, update for production:

```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://meet-backend.onrender.com/api' 
  : 'http://localhost:8001/api';

const WS_BASE_URL = import.meta.env.PROD 
  ? 'wss://meet-backend.onrender.com/ws' 
  : 'ws://localhost:8001/ws';
```

### Update CORS Settings

After deploying frontend, update backend environment variable:
- **CORS_ALLOWED_ORIGINS:** `https://your-frontend-url.com`

## 📝 Important Notes

### Free Tier Limitations
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down will be slow (cold start)
- Consider upgrading to paid tier for production use

### Database (Optional)
For persistent room storage:
1. Add PostgreSQL database on Render
2. Update `DATABASES` in settings.py to use `DATABASE_URL` environment variable
3. Install `psycopg2-binary` in requirements.txt

### Environment Variables Summary

Required for production:
```bash
SECRET_KEY=<generate-secure-key>
DEBUG=False
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.com
REDIS_URL=redis://...
```

## 🧪 Testing Deployment

After deployment:
1. Check backend health: `https://meet-backend.onrender.com/api/rooms/`
2. Test WebSocket: Open browser console and connect to `wss://meet-backend.onrender.com/ws/room/test/`
3. Full test: Create a meeting from your deployed frontend

## 🐛 Troubleshooting

**Application Error:**
- Check Render logs: Dashboard → Your Service → "Logs"
- Verify all environment variables are set correctly
- Ensure build.sh is executable: `chmod +x build.sh`

**WebSocket Connection Failed:**
- Check CORS settings include your frontend URL
- Verify Redis is running and connected
- Check browser console for WebSocket errors

**Static Files Not Loading:**
- Run `python manage.py collectstatic` in build script
- Verify WhiteNoise is in MIDDLEWARE
- Check STATIC_ROOT is configured

## 🔗 Useful Commands

```bash
# Test build script locally
./build.sh

# Check if Daphne works locally
daphne -p 8001 backend.asgi:application

# Collect static files manually
python manage.py collectstatic --no-input
```

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Channels Deployment](https://channels.readthedocs.io/en/stable/deploying.html)
