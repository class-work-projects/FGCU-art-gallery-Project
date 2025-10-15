import { useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import AudioTrackCard from '../components/AudioTrackCard';
import { DataverseSearchFileItem } from '../types/dataverse';

export default function AudioPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useAudio(query, {}, true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handlePlay = (id: string) => {
    setActiveId(id);
  };
  const handlePause = (id: string) => {
    if (activeId === id) setActiveId(null);
  };

  const items = (data?.items || []).filter((i): i is DataverseSearchFileItem => i.type === 'file');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Audio Library</h1>
        <div className="flex-1 w-full sm:max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search audio tracks..."
            className="w-full px-3 py-2 rounded-md bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {isLoading && <div className="text-sm text-neutral-500">Loading audio...</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(file => {
          const id = file.file_id;
          return (
            <AudioTrackCard
              key={id}
              fileId={id}
              title={file.name || 'Untitled'}
              description={file.description}
              datasetPersistentId={file.dataset_persistent_id}
              active={activeId === id}
              onPlay={handlePlay}
              onPause={handlePause}
            />
          );
        })}
      </div>

      {!isLoading && items.length === 0 && (
        <div className="text-sm text-neutral-400">No audio tracks found.</div>
      )}
    </div>
  );
}
