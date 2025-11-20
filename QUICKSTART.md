# Quick Start Guide

## Security Update: API Proxy Server

Your API token is now kept secure on the server side! 🔒

## What Changed?

1. **New Express Server** (`server/index.js`): Handles all Dataverse API requests
2. **Secure API Token**: Token stays on server, never exposed to browser
3. **Proxy Architecture**: Client calls your server, server calls Dataverse
4. **Unpublished Content**: Works automatically when `SHOW_HIDDEN=true` on server

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Your `.env` file now has two sections:

**Client-side (exposed to browser):**
- `VITE_API_BASE_URL=http://localhost:3001/api` - Your proxy server
- `VITE_DATAVERSE_BASE_URL` - For reference only
- `VITE_PORT` - Frontend dev server port

**Server-side (NOT exposed, kept secure):**
- `DATAVERSE_API_TOKEN` - Your secret API token 🔑
- `SHOW_HIDDEN=true` - Show unpublished/draft content
- `DATAVERSE_COLLECTIONS=art,root` - Limit searches to specific collections
- `SERVER_PORT=3001` - Backend proxy port
- `CORS_ORIGIN` - Allowed frontend origin

### 3. Run the Application

**Option A: Run both together (recommended)**
```bash
npm run dev:all
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend Health Check: http://localhost:3001/health

## How It Works

### Before (Insecure):
```
Browser → Dataverse API (with exposed token)
```

### After (Secure):
```
Browser → Express Proxy → Dataverse API (with secure token)
```

## Environment Variables Details

### `SHOW_HIDDEN=true`
When enabled with a valid API token:
- Shows unpublished datasets in search results
- Fetches draft versions instead of published versions
- Includes restricted files you have access to

### `DATAVERSE_API_TOKEN`
- Required for unpublished content
- Required for restricted files
- Required for admin operations
- **NEVER** put this in a `VITE_` variable!

### `DATAVERSE_COLLECTIONS`
- Comma-separated list of dataverse collection aliases
- Example: `art,root,music`
- Get alias from URL: `https://dataverse.fgcu.edu/dataverse/art` → use `art`
- Leave empty to search all collections
- Searches are performed across all listed collections and results are merged

## Troubleshooting

### "Connection refused" errors
Make sure the proxy server is running:
```bash
npm run dev:server
```

### "CORS error"
Check that `CORS_ORIGIN` in `.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:5173
```

### Not seeing unpublished content
Verify:
1. `SHOW_HIDDEN=true` in `.env`
2. Valid `DATAVERSE_API_TOKEN` in `.env`
3. Server restarted after changing `.env`

### Not seeing content from specific collections
Verify:
1. `DATAVERSE_COLLECTIONS` is set correctly in `.env` (e.g., `art,root`)
2. Collection aliases match the URL path (e.g., for `https://dataverse.fgcu.edu/dataverse/art`, use `art`)
3. Server restarted after changing `.env`
4. Check health endpoint: `curl http://localhost:3001/health` to see configured collections

### API token exposed warning
If you see your API token in browser dev tools:
1. Check it's NOT in a `VITE_` variable
2. Make sure client is using proxy (`VITE_API_BASE_URL`)
3. Clear browser cache and restart dev servers

## Production Deployment

For production, you'll need to:
1. Deploy the Express server to a hosting service (Heroku, Railway, AWS, etc.)
2. Set environment variables on the hosting platform (not in `.env`)
3. Update `VITE_API_BASE_URL` to point to your production server
4. Update `CORS_ORIGIN` to your production frontend URL
5. Use HTTPS for both frontend and backend

## Security Best Practices

✅ **DO:**
- Keep API token in server-side environment variables
- Use `.gitignore` to exclude `.env` files
- Use HTTPS in production
- Restrict CORS to your domain

❌ **DON'T:**
- Put API token in `VITE_` variables
- Commit `.env` file to git
- Expose API endpoints without CORS protection
- Use HTTP in production

## Need Help?

Check the server logs for detailed error messages:
```bash
npm run dev:server
```

The health endpoint shows your configuration:
```bash
curl http://localhost:3001/health
```
