# Dataverse API Proxy Server

This Express server acts as a secure proxy between your React frontend and the Dataverse API. It keeps your API token secure on the server side, preventing it from being exposed in the browser.

## Features

- 🔐 Secure API token handling (server-side only)
- 👁️ Support for unpublished/draft content when `SHOW_HIDDEN=true`
- 📚 Filter searches to specific dataverse collections
- 🖼️ Proxied file downloads with authentication
- 🔄 CORS support for local development
- ✅ Health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
# Server-side variables (NOT exposed to browser)
DATAVERSE_BASE_URL=https://dataverse.fgcu.edu
DATAVERSE_API_TOKEN=your-api-token-here
SHOW_HIDDEN=true
# Comma-separated list of dataverse collections to search
# Use the alias: https://dataverse.fgcu.edu/dataverse/art -> "art"
DATAVERSE_COLLECTIONS=art,root
SERVER_PORT=3001
CORS_ORIGIN=http://localhost:5173
```

3. Run the server:
```bash
# Run server only
npm run dev:server

# Run both server and client together
npm run dev:all
```

## API Endpoints

### Search
`GET /api/search`
- Proxies Dataverse search API
- Automatically includes `show_hidden` parameter based on server config
- If `DATAVERSE_COLLECTIONS` is configured, searches only those collections and merges results
- Supports all standard Dataverse search parameters

### Get Dataset
`GET /api/datasets/:persistentId/versions/:version`
- Fetches dataset metadata
- Uses `:draft` version when `SHOW_HIDDEN=true`

### List Dataset Files
`GET /api/datasets/:idOrPid/versions/:version/files`
- Lists files in a dataset
- Supports both persistent IDs and numeric IDs

### Get File Metadata
`GET /api/files/:fileId`
- Fetches file metadata

### Download File
`GET /api/access/datafile/:fileId`
- Proxies file downloads with authentication
- Supports `?imageThumb=true` for thumbnails

### Health Check
`GET /health`
- Returns server status and configuration

## Security Notes

- ⚠️ Never commit `.env` file with real API tokens
- 🔒 API token is only stored server-side
- 🌐 Configure CORS_ORIGIN for production use
- 🚀 For production, use environment variables instead of `.env` file

## Production Deployment

For production, set environment variables directly on your hosting platform:
- `DATAVERSE_BASE_URL`
- `DATAVERSE_API_TOKEN`
- `SHOW_HIDDEN`
- `SERVER_PORT`
- `CORS_ORIGIN` (set to your production domain)
