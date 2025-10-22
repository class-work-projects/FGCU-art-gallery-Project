The **FGCU Art Gallery** is a modern web application developed to showcase the artistic work of the **Bower School of Music & the Arts** at Florida Gulf Coast University.  
It integrates with **Dataverse** to organize, display, and manage artwork and music contributions from FGCU students and faculty.

Built using **React**, **Vite**, and **TypeScript**, the gallery provides an elegant, responsive interface for exploring FGCU-hosted artworks (images, audio, and other media) stored in the [Dataverse instance](https://dataverse.fgcu.edu/).  
Its design draws inspiration from the minimalist, high-impact aesthetic of major art institutions such as MoMA and The Met.


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

## 🎥 **Demo Video:** 
 
[![Watch the demo](https://drive.google.com/file/d/13tr2y0_ZaUmgaS50z08Zqy6F03MEDm-j/view?usp=sharing)

A short walkthrough of the FGCU Art Gallery web app demonstrating Dataverse integration, artwork browsing, and responsive design.

## Contributors
This project was developed collaboratively as part of **CEN 3031 – Software Engineering Fundamentals** at **Florida Gulf Coast University**.

**Team Members**
- Zach Van — Team Lead / Frontend Integration  
- Marco Sanchez — Documentation & System Testing  
- Christian Fernandez — [Role TBD]  
- Abigail Morris — [Role TBD]  
- Kenneth Jimenez — [Role TBD]  

**Instructor:** Dr. Chengyi Qu

---
## License
MIT (project scaffolding). Dataset/file licensing controlled by Dataverse metadata.


## License
MIT (project scaffolding). Dataset/file licensing controlled by Dataverse metadata.
