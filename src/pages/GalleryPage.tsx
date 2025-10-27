import { useState } from 'react';
import ArtworkCard from '../components/ArtworkCard';
import { useImageDatasets } from '../hooks/useImageDatasets';
import FilterSelector from '../components/FilterSelector';
import LoadingIcon from '../components/LoadingIcon';

export default function GalleryPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<{ fq?: string[] } | undefined>(undefined);
  const { data: datasets, isLoading } = useImageDatasets(query, filters);

  return (
    <div className="flex flex-col gap-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 p-8 -mx-6">
        <div className="absolute inset-0 bg-grid-neutral-700/[0.2] [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-neutral-200/[0.2]" />
        <div className="relative flex flex-col gap-6 max-w-[85rem] mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent animate-slide-in">
              Art Gallery
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl text-lg font-light leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Explore artworks contributed by FGCU professors and art majors. Search datasets that contain high-resolution images and audio related to campus art.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, subject..."
              className="w-full sm:w-96 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-4 py-3 text-sm shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-md focus-ring hover:-translate-y-0.5"
            />
            <FilterSelector onChange={setFilters} />
          </div>
        </div>
      </div>

      {isLoading && <LoadingIcon />}

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
    </div>
  );
}
