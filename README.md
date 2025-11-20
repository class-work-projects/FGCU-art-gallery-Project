The **FGCU Art Gallery** is a modern web application developed to showcase the artistic work of the **Bower School of Music & the Arts** at Florida Gulf Coast University.  
It integrates with **Dataverse** to organize, display, and manage artwork and music contributions from FGCU students and faculty.

Built using **React**, **Vite**, and **TypeScript**, the gallery provides an elegant, responsive interface for exploring FGCU-hosted artworks (images, audio, and other media) stored in the [Dataverse instance](https://dataverse.fgcu.edu/).  
Its design draws inspiration from the minimalist, high-impact aesthetic of major art institutions such as MoMA and The Met.

> 🧠 **JSFuck Edition**: This branch (`bf-test`) includes a special build process that converts the entire app to [JSFuck](http://www.jsfuck.com/) - using only 6 characters: `[]()!+`. The result? A 471MB masterpiece of obfuscation! See [JSFUCK_RESULTS.md](JSFUCK_RESULTS.md) for details.


## Motivation
The FGCU Library currently uses Dataverse for storing research data, papers, and code. However, artworks such as paintings and music from the Bower School of Music & the Arts do not fit neatly into Dataverse’s default structure.  
This project extends Dataverse to showcase artistic works through a modern, user-friendly web interface inspired by museum sites like MoMA and The Met.

## Core Features (MVP)

### 🎨 Frontend / UI
- Gallery view of artwork collections with search and filtering  
- Modern React + Tailwind CSS interface with dark-mode support  
- Responsive layout inspired by professional museum websites  
- Component-based architecture for easy maintenance and expansion  

### ⚙️ Backend / Data
- Dataverse API integration (Search, Dataset, Files)  
- React Query data layer with caching for efficient performance  
- Secure metadata display and download links  
- Admin placeholder page for upload and metadata editing  

## Roadmap / Next Steps
- Authentication & role-based access (JWT + Dataverse tokens)
- Secure upload workflow (dataset creation + file upload)
- Faceted filtering (subjects, year, medium)
- Image thumbnails via file endpoint (enable once IDs confirmed)
- Audio/video preview player
- Accessibility + keyboard navigation enhancements
- Metadata enrichment & custom domain taxonomy

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS (utility-first styling) + Framer Motion (micro-interactions)
- React Router v6
- @tanstack/react-query for async + caching
- Axios for HTTP

## Environment Variables

The app uses a proxy server to keep API tokens secure. Configure `.env` with:

### Client-side variables (exposed to browser):
```env
VITE_DATAVERSE_BASE_URL=https://dataverse.fgcu.edu
VITE_API_BASE_URL=http://localhost:3001/api
VITE_PORT=5173
VITE_ALLOWED_HOSTS=localhost,127.0.0.1
```

### Server-side variables (NOT exposed to browser - keep secure!):
```env
DATAVERSE_BASE_URL=https://dataverse.fgcu.edu
DATAVERSE_API_TOKEN=your-api-token-here
SHOW_HIDDEN=true
# Limit searches to specific collections (comma-separated)
DATAVERSE_COLLECTIONS=art,root
SERVER_PORT=3001
CORS_ORIGIN=http://localhost:5173
```

⚠️ **Never commit your `.env` file with real API tokens!**

## Development

### Option 1: Local Development (Recommended)

1. Install dependencies:
```bash
npm install
```

2. Run both server and client together:
```bash
npm run dev:all
```

Or run them separately:
```bash
# Terminal 1 - Backend server
npm run dev:server

# Terminal 2 - Frontend client
npm run dev
```

Visit http://localhost:5173

### Option 2: Docker Development

Run both frontend and backend in Docker containers:
```bash
npm run docker:dev:build
```

Visit http://localhost:5173

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

## Production Deployment

### Using Docker (Recommended)

Single container serves both API and frontend:
```bash
npm run docker:prod:build
```

Application available at http://localhost:3001

### Manual Production Build
```bash
# Build frontend
npm run build

# Set environment to production
export NODE_ENV=production

# Start server (serves both API and built frontend)
npm run dev:server
```

## Testing
```bash
npm test
```

## Project Structure
```
app/
  src/
    api/            # Dataverse client wrappers
    components/     # Reusable UI components
    hooks/          # React Query hooks
    pages/          # Route-level pages
    types/          # TypeScript interfaces
    styles.css      # Tailwind entry
```

## Dataverse API Notes
- Uses Search API for discovering datasets (type=dataset)
- Uses Native API for dataset JSON and file listing
- File download links constructed with /api/access/datafile/{id}

## Accessibility & Performance
- Semantic HTML and focus-ring utility
- Responsive CSS grid, mobile-first
- Deferred image loading (loading="lazy")

## 🎥 **Demo Video:**  
[Watch the FGCU Art Gallery Demo on Google Drive](https://drive.google.com/file/d/13tr2y0_ZaUmgaS50z08Zqy6F03MEDm-j/view?usp=sharing)

A short walkthrough of the FGCU Art Gallery web app demonstrating Dataverse integration, artwork browsing, and responsive design.


## Contributors
This project was developed collaboratively as part of **CEN 3031 – Software Engineering Fundamentals** at **Florida Gulf Coast University**.

**Team Members**
- Zach Van — Team Lead / Frontend Integration; managed branch merges and coordinated feature integration.
- Abigail Morris — Lead PowerPoint Development; configured Docker and Nginx for deployment; assisted with audio debugging.
- Marco Sanchez — Documentation, Audio Debugging, and System Testing; implemented partial search functionality and developed dynamic seasonal loading icons.
- Christian Fernandez — Frontend Developer; implemented advanced search filter functionality to improve data retrieval and user interaction.
- Kenneth Jimenez — UI/UX Contributor; enhanced PowerPoint visuals and implemented the clear search feature for improved interface usability.

**Instructor:** Dr. Chengyi Qu

---
## License
MIT (project scaffolding). Dataset/file licensing controlled by Dataverse metadata.


## License
MIT (project scaffolding). Dataset/file licensing controlled by Dataverse metadata.
