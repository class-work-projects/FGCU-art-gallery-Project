# FGCU Dataverse Art Gallery

A modern React + Vite + TypeScript web application for exploring FGCU-hosted artworks (images, audio, other media) stored in the Dataverse instance at https://dataverse.fgcu.edu/ . Inspired by the minimalist, high-impact design language of MoMA.

## Features (MVP)
- Gallery view of datasets (artwork collections) with search
- Dataset detail page with file listing & download links
- Responsive, modern UI (Tailwind + custom theming, dark mode)
- React Query based data layer with caching
- Dataverse API integration (Search, Dataset, Files)
- Admin placeholder page for future upload/metadata editing

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
Copy `.env.example` to `.env` and adjust as needed:
```
VITE_DATAVERSE_BASE_URL=https://dataverse.fgcu.edu
VITE_DATAVERSE_API_TOKEN= # optional, only for private/unpublished or admin actions
VITE_PORT=5173 # optional custom dev/preview port
```

## Development
Install dependencies and start dev server:
```
npm install
npm run dev
```
Visit http://localhost:5173

## Testing
```
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

## License
MIT (project scaffolding). Dataset/file licensing controlled by Dataverse metadata.
