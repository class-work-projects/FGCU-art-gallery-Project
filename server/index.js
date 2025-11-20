import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configure CORS - adjust origins as needed for production
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-Cache', 'X-Powered-By']
}));

app.use(express.json());

// Serve static files in production
if (NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
}

// Dataverse API configuration (server-side only)
const DATAVERSE_BASE_URL = process.env.DATAVERSE_BASE_URL || 'https://dataverse.fgcu.edu';
const DATAVERSE_API_TOKEN = process.env.DATAVERSE_API_TOKEN;
const SHOW_HIDDEN = process.env.SHOW_HIDDEN === 'true';
// Parse dataverse collections to search (comma-separated list)
const DATAVERSE_COLLECTIONS = process.env.DATAVERSE_COLLECTIONS 
  ? process.env.DATAVERSE_COLLECTIONS.split(',').map(c => c.trim()).filter(Boolean)
  : [];

// Cache configuration - serves stale data immediately, revalidates in background
const cache = new Map();
const CACHE_FRESH_TTL = 5 * 60 * 1000; // 5 minutes - data is considered fresh
const CACHE_STALE_TTL = 60 * 60 * 1000; // 60 minutes - serve stale data while revalidating
const activeRevalidations = new Map(); // Track in-progress revalidations

// Cache cleanup interval (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.staleAt) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Create axios instance for Dataverse
const dataverseApi = axios.create({
  baseURL: `${DATAVERSE_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add API token to requests if available
dataverseApi.interceptors.request.use((config) => {
  if (DATAVERSE_API_TOKEN) {
    config.headers['X-Dataverse-key'] = DATAVERSE_API_TOKEN;
  }
  return config;
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    // Create normalized cache key (sort keys for consistency)
    const queryParams = {
      q: req.query.q || '*',
      type: req.query.type,
      subtree: req.query.subtree,
      start: req.query.start || '0',
      per_page: req.query.per_page || '50'
    };
    const cacheKey = `search:${JSON.stringify(queryParams, Object.keys(queryParams).sort())}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    console.log(`\n🔍 Cache lookup for search`);
    console.log(`   Query: ${JSON.stringify(queryParams)}`);
    console.log(`   Cache has entry: ${!!cached}`);
    if (cached) {
      console.log(`   Fresh until: ${new Date(cached.freshUntil).toLocaleTimeString()}`);
      console.log(`   Stale at: ${new Date(cached.staleAt).toLocaleTimeString()}`);
      console.log(`   Current time: ${new Date(now).toLocaleTimeString()}`);
    }
    
    // If we have cached data (even if stale), return it immediately
    if (cached) {
      const isFresh = now < cached.freshUntil;
      const isStale = now >= cached.freshUntil && now < cached.staleAt;
      
      if (isFresh) {
        console.log('🟢 Cache FRESH - returning cached search results');
        res.set('X-Cache', 'HIT-FRESH');
        res.json(cached.data);
        return;
      }
      
      if (isStale) {
        console.log('🟡 Cache STALE - returning stale data, revalidating in background');
        res.set('X-Cache', 'HIT-STALE');
        res.json(cached.data);
        
        // Revalidate in background (don't await)
        if (!activeRevalidations.has(cacheKey)) {
          activeRevalidations.set(cacheKey, true);
          performSearch(req.query, cacheKey).finally(() => {
            activeRevalidations.delete(cacheKey);
          });
        }
        return;
      }
    }
    
    // No cache or expired - fetch fresh data
    console.log('🔴 Cache MISS - fetching fresh search results');
    res.set('X-Cache', 'MISS');
    const data = await performSearch(req.query, cacheKey);
    res.json(data);
  } catch (error) {
    console.error('Search error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to search Dataverse' }
    });
  }
});

// Helper function to perform search and cache results
async function performSearch(query, cacheKey) {
  console.log('\n=== SEARCH REQUEST ===');
  console.log('Query params:', query);
  console.log('Configured collections:', DATAVERSE_COLLECTIONS);
  
  // If collections are configured, ALWAYS restrict to those collections
  // Ignore any subtree parameter from the client
  if (DATAVERSE_COLLECTIONS.length > 0) {
    // Search all configured collections and merge results
    const allResults = [];
    const seenIds = new Set(); // Track unique items to avoid duplicates
    let totalCount = 0;
    
    for (const collection of DATAVERSE_COLLECTIONS) {
      const params = {
        q: query.q || '*',
        type: query.type,
        start: query.start,
        per_page: query.per_page || 1000, // Increase default limit
        subtree: collection,
        show_facets: query.show_facets === 'true',
        fq: query.fq,
        metadata_fields: query.metadata_fields,
        // Include show_hidden if configured and API token is available
        show_hidden: SHOW_HIDDEN && DATAVERSE_API_TOKEN ? true : undefined
      };
      
      console.log(`\nSearching collection '${collection}' with params:`, params);
      
      try {
        const response = await dataverseApi.get('/search', { params });
        console.log(`Collection '${collection}' returned ${response.data?.data?.items?.length || 0} items`);
        
        if (response.data?.data?.items) {
          // Log each item for debugging
          response.data.data.items.forEach((item, idx) => {
            console.log(`  Item ${idx + 1}:`, {
              id: item.global_id || item.id,
              name: item.name,
              type: item.type,
              published_at: item.published_at
            });
          });
          
          // Add items, avoiding duplicates
          response.data.data.items.forEach(item => {
            const itemId = item.global_id || item.id || JSON.stringify(item);
            if (!seenIds.has(itemId)) {
              seenIds.add(itemId);
              allResults.push(item);
            }
          });
          totalCount = allResults.length; // Use actual count after deduplication
        }
      } catch (err) {
        console.error(`Error searching collection '${collection}':`, err.message);
      }
    }
    
    console.log(`\nTotal unique results: ${allResults.length}`);
    console.log('=== END SEARCH ===\n');
    
    // Return merged results
    const data = {
      status: 'OK',
      data: {
        items: allResults,
        total_count: totalCount,
        start: parseInt(query.start) || 0,
        count_in_response: allResults.length
      }
    };
    
    // Cache the results
    const now = Date.now();
    const cacheEntry = {
      data,
      freshUntil: now + CACHE_FRESH_TTL,
      staleAt: now + CACHE_STALE_TTL
    };
    cache.set(cacheKey, cacheEntry);
    console.log(`💾 Cached search results - Fresh until: ${new Date(cacheEntry.freshUntil).toLocaleTimeString()}`);
    
    return data;
  }
  
  // Standard single search (when no collections configured)
  const params = {
    q: query.q || '*',
    type: query.type,
    start: query.start,
    per_page: query.per_page,
    subtree: query.subtree,
    show_facets: query.show_facets === 'true',
    fq: query.fq,
    metadata_fields: query.metadata_fields,
    // Include show_hidden if configured and API token is available
    show_hidden: SHOW_HIDDEN && DATAVERSE_API_TOKEN ? true : undefined
  };

  const response = await dataverseApi.get('/search', { params });
  const data = response.data;
  
  // Cache the results
  const now = Date.now();
  const cacheEntry = {
    data,
    freshUntil: now + CACHE_FRESH_TTL,
    staleAt: now + CACHE_STALE_TTL
  };
  cache.set(cacheKey, cacheEntry);
  console.log(`💾 Cached search results - Fresh until: ${new Date(cacheEntry.freshUntil).toLocaleTimeString()}`);
  
  return data;
}

// Get dataset endpoint
app.get('/api/datasets/:persistentId/versions/:version', async (req, res) => {
  try {
    const { persistentId, version } = req.params;
    // If SHOW_HIDDEN is enabled, try draft first, otherwise use latest
    let effectiveVersion = (SHOW_HIDDEN && DATAVERSE_API_TOKEN) ? ':draft' : ':latest';

    try {
      const response = await dataverseApi.get(
        `/datasets/:persistentId/versions/${effectiveVersion}`,
        { params: { persistentId: req.query.persistentId } }
      );
      res.json(response.data);
    } catch (draftError) {
      // If draft version not found and we tried draft, fallback to latest
      if (effectiveVersion === ':draft' && draftError.response?.status === 404) {
        const response = await dataverseApi.get(
          `/datasets/:persistentId/versions/:latest`,
          { params: { persistentId: req.query.persistentId } }
        );
        res.json(response.data);
      } else {
        throw draftError;
      }
    }
  } catch (error) {
    console.error('Dataset error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to fetch dataset' }
    });
  }
});

// List dataset files endpoint
app.get('/api/datasets/:idOrPid/versions/:version/files', async (req, res) => {
  try {
    const { idOrPid, version } = req.params;
    // If SHOW_HIDDEN is enabled, try draft first, otherwise use latest
    let effectiveVersion = (SHOW_HIDDEN && DATAVERSE_API_TOKEN) ? ':draft' : ':latest';

    const isPid = idOrPid === ':persistentId';
    
    try {
      const path = isPid
        ? `/datasets/:persistentId/versions/${effectiveVersion}/files`
        : `/datasets/${idOrPid}/versions/${effectiveVersion}/files`;

      const response = await dataverseApi.get(path, {
        params: isPid ? { persistentId: req.query.persistentId } : undefined
      });
      res.json(response.data);
    } catch (draftError) {
      // If draft version not found and we tried draft, fallback to latest
      if (effectiveVersion === ':draft' && draftError.response?.status === 404) {
        const path = isPid
          ? `/datasets/:persistentId/versions/:latest/files`
          : `/datasets/${idOrPid}/versions/:latest/files`;

        const response = await dataverseApi.get(path, {
          params: isPid ? { persistentId: req.query.persistentId } : undefined
        });
        res.json(response.data);
      } else {
        throw draftError;
      }
    }
  } catch (error) {
    console.error('Files error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to fetch files' }
    });
  }
});

// Get file metadata endpoint
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const response = await dataverseApi.get(`/files/${fileId}`);
    res.json(response.data);
  } catch (error) {
    console.error('File metadata error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: 'Failed to fetch file metadata' }
    });
  }
});

// Proxy file downloads (optional - allows authentication for restricted files)
app.get('/api/access/datafile/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const imageThumb = req.query.imageThumb === 'true';
    
    // Create cache key
    const cacheKey = `file:${fileId}-${imageThumb ? 'thumb' : 'full'}`;
    
    // Check if this is an image thumbnail request (only cache these)
    const isImageThumb = imageThumb;
    
    // Check cache for image thumbnails only
    if (isImageThumb) {
      const now = Date.now();
      const cached = cache.get(cacheKey);
      
      console.log(`🖼️  Image thumbnail request for ${fileId} - Cached: ${!!cached}`);
      
      if (cached) {
        const isFresh = now < cached.freshUntil;
        const isStale = now >= cached.freshUntil && now < cached.staleAt;
        
        if (isFresh || isStale) {
          console.log(`📦 Cache ${isFresh ? 'FRESH' : 'STALE'} for thumbnail ${fileId}`);
          res.set('Content-Type', cached.contentType);
          res.set('X-Cache', isFresh ? 'HIT-FRESH' : 'HIT-STALE');
          res.send(cached.data);
          
          // Revalidate in background if stale
          if (isStale && !activeRevalidations.has(cacheKey)) {
            activeRevalidations.set(cacheKey, true);
            fetchAndCacheFile(fileId, imageThumb, cacheKey).finally(() => {
              activeRevalidations.delete(cacheKey);
            });
          }
          return;
        }
      }
      
      // No cache or expired - fetch and cache thumbnail
      console.log(`📦 Cache MISS for thumbnail ${fileId} - fetching and caching`);
      res.set('X-Cache', 'MISS');
      const { data, contentType } = await fetchAndCacheFile(fileId, imageThumb, cacheKey);
      res.set('Content-Type', contentType);
      res.send(data);
    } else {
      // Stream full files (images, audio, etc.) - don't cache to save memory
      const response = await axios.get(
        `${DATAVERSE_BASE_URL}/api/access/datafile/${fileId}`,
        {
          headers: DATAVERSE_API_TOKEN ? { 'X-Dataverse-key': DATAVERSE_API_TOKEN } : {},
          responseType: 'stream'
        }
      );
      res.set('Content-Type', response.headers['content-type']);
      if (response.headers['content-disposition']) {
        res.set('Content-Disposition', response.headers['content-disposition']);
      }
      response.data.pipe(res);
    }
  } catch (error) {
    console.error('File download error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: { message: 'Failed to download file' }
    });
  }
});

// Helper function to fetch and cache file
async function fetchAndCacheFile(fileId, imageThumb, cacheKey) {
  const response = await axios.get(
    `${DATAVERSE_BASE_URL}/api/access/datafile/${fileId}`,
    {
      params: imageThumb ? { imageThumb: true } : {},
      headers: DATAVERSE_API_TOKEN ? { 'X-Dataverse-key': DATAVERSE_API_TOKEN } : {},
      responseType: 'arraybuffer'
    }
  );

  const contentType = response.headers['content-type'];
  
  // Cache images
  if (contentType?.startsWith('image/')) {
    const now = Date.now();
    const cacheEntry = {
      data: response.data,
      contentType: contentType,
      freshUntil: now + CACHE_FRESH_TTL,
      staleAt: now + CACHE_STALE_TTL
    };
    cache.set(cacheKey, cacheEntry);
    console.log(`💾 Cached ${imageThumb ? 'thumbnail' : 'full image'} ${fileId} - Fresh until: ${new Date(cacheEntry.freshUntil).toLocaleTimeString()}`);
  }
  
  return { data: response.data, contentType };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: NODE_ENV,
    dataverseUrl: DATAVERSE_BASE_URL,
    hasApiToken: !!DATAVERSE_API_TOKEN,
    showHidden: SHOW_HIDDEN,
    collections: DATAVERSE_COLLECTIONS,
    collectionsConfigured: DATAVERSE_COLLECTIONS.length > 0
  });
});

// Cache statistics endpoint (for debugging)
app.get('/api/cache/stats', (req, res) => {
  const now = Date.now();
  const stats = {
    totalEntries: cache.size,
    fresh: 0,
    stale: 0,
    expired: 0,
    entries: []
  };
  
  for (const [key, value] of cache.entries()) {
    const isFresh = now < value.freshUntil;
    const isStale = now >= value.freshUntil && now < value.staleAt;
    const isExpired = now >= value.staleAt;
    
    if (isFresh) stats.fresh++;
    else if (isStale) stats.stale++;
    else if (isExpired) stats.expired++;
    
    stats.entries.push({
      key: key.substring(0, 80),
      status: isFresh ? 'fresh' : (isStale ? 'stale' : 'expired'),
      freshUntil: new Date(value.freshUntil).toLocaleTimeString(),
      staleAt: new Date(value.staleAt).toLocaleTimeString()
    });
  }
  
  res.json(stats);
});

// In production, serve the React app for all non-API routes
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 Dataverse API Proxy Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📡 Proxying to: ${DATAVERSE_BASE_URL}`);
  console.log(`🔑 API Token configured: ${DATAVERSE_API_TOKEN ? 'Yes' : 'No'}`);
  console.log(`👁️  Show hidden content: ${SHOW_HIDDEN ? 'Yes' : 'No'}`);
  if (DATAVERSE_COLLECTIONS.length > 0) {
    console.log(`📚 Searching collections: ${DATAVERSE_COLLECTIONS.join(', ')}`);
  } else {
    console.log(`📚 Searching all collections (no filter)`);
  }
  if (NODE_ENV === 'production') {
    console.log(`📦 Serving static frontend from /public`);
  }
  console.log();
});
