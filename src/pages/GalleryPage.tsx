import { useState } from 'react';
import ArtworkCard from '../components/ArtworkCard';
import { useImageDatasets } from '../hooks/useImageDatasets';
import FilterSelector from '../components/FilterSelector';
import LoadingIcon from '../components/LoadingIcon';
import BackToTopButton from '../components/BackToTopButton';

export default function GalleryPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<{ fq?: string[] } | undefined>(undefined);
  const { data: datasets, isLoading } = useImageDatasets(query, filters);

  return (
    <div className="flex flex-col gap-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 dark:from-purple-900 dark:via-pink-900 dark:to-amber-900 p-8 -mx-6 animate-pulse-glow">
        <div className="absolute inset-0 bg-grid-neutral-700/[0.2] [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-neutral-200/[0.2] animate-shimmer" />
        <div className="relative flex flex-col gap-6 max-w-[85rem] mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 dark:from-purple-400 dark:via-pink-300 dark:to-amber-300 bg-clip-text text-transparent animate-slide-in animate-float">
              Art Gallery
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl text-lg font-light leading-relaxed animate-fade-in bg-gradient-to-r from-purple-600/10 to-amber-500/10 dark:from-purple-400/10 dark:to-amber-300/10 p-4 rounded-lg backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
              Explore artworks contributed by FGCU professors and art majors. Search datasets that contain high-resolution images and audio related to campus art.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, subject..."
              className="w-full sm:w-96 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-4 py-3 text-sm shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-md focus-ring hover:-translate-y-0.5"
            />
            {query && (
              <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                x 
                </button>
            )}
            </div>
            <FilterSelector onChange={setFilters} />
          </div>
        </div>
      </div>

      {isLoading && <LoadingIcon />}

      {!isLoading && datasets && datasets.length > 0 && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
          Found {datasets.length} artwork{datasets.length !== 1 ? 's' : ''}
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {/* Grid container with staggered animation */}
        {datasets?.map(ds => {
          const dataverseBase = (import.meta as any).env?.VITE_DATAVERSE_BASE_URL || 'https://dataverse.fgcu.edu';
          const externalHref = `${dataverseBase}/dataset.xhtml?persistentId=${encodeURIComponent(ds.persistentId)}`;
          return (
            <div 
              key={ds.persistentId}
              className="animate-scale-in hover-lift"
              style={{ 
                animationDelay: `${datasets.indexOf(ds) * 0.1}s`,
                animationFillMode: 'backwards'
              }}
            >
              <ArtworkCard
                id={ds.persistentId}
                title={ds.title}
                description={ds.description}
                thumbnailUrl={ds.representativeThumb}
                fullImageUrl={ds.representativeFull}
                datasetPersistentId={ds.persistentId}
                image
                externalHref={externalHref}
              />
            </div>
          );
        })}
      </div>

      {!isLoading && (datasets?.length || 0) === 0 && (
        <div className="text-sm text-neutral-400">No artworks found.</div>
      )}
      <BackToTopButton />

    </div>
  );
}