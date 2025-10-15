import { useState } from 'react';
import ArtworkCard from '../components/ArtworkCard';
import { useImageDatasets } from '../hooks/useImageDatasets';

export default function GalleryPage() {
  const [query, setQuery] = useState('');
  const { data: datasets, isLoading } = useImageDatasets(query);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>
        <p className="text-neutral-500 max-w-2xl text-sm">Explore artworks contributed by FGCU professors and art majors. Search datasets that contain high-resolution images and audio related to campus art.</p>
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, subject..."
            className="w-full sm:w-96 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm focus-ring"
          />
        </div>
      </div>

      {isLoading && <div className="text-sm text-neutral-500">Loading artworks...</div>}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {datasets?.map(ds => {
          const dataverseBase = (import.meta as any).env?.VITE_DATAVERSE_BASE_URL || 'https://dataverse.fgcu.edu';
          const externalHref = `${dataverseBase}/dataset.xhtml?persistentId=${encodeURIComponent(ds.persistentId)}`;
          return (
            <ArtworkCard
              key={ds.persistentId}
              id={ds.persistentId}
              title={ds.title}
              description={ds.description}
              thumbnailUrl={ds.representativeThumb}
              fullImageUrl={ds.representativeFull}
              datasetPersistentId={ds.persistentId}
              image
              externalHref={externalHref}
            />
          );
        })}
      </div>

      {!isLoading && (datasets?.length || 0) === 0 && (
        <div className="text-sm text-neutral-400">No artworks found.</div>
      )}
    </div>
  );
}
