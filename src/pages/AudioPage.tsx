import { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../hooks/useAudio';
import AudioTrackCard from '../components/AudioTrackCard';
import { DataverseSearchFileItem } from '../types/dataverse';

export default function AudioPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useAudio(query, {}, true);
  const [activeId, setActiveId] = useState<string | null>(null);

   const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowBackToTop(window.scrollY > 400);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // initialize in case user loads mid-page
    onScroll();
    return () => window.removeEventListener('scroll', onScroll as any);
  }, []);

  const handlePlay = (id: string) => {
    setActiveId(id);
  };
  const handlePause = (id: string) => {
    if (activeId === id) setActiveId(null);
  };

  const items = (data?.items || []).filter((i): i is DataverseSearchFileItem => i.type === 'file');

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 p-8 -mx-6 animate-pulse-glow mb-4">
        <div className="absolute inset-0 bg-grid-neutral-700/[0.2] [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-neutral-200/[0.2] animate-shimmer" />
        <div className="relative flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-float">Audio Library</h1>
          <div className="flex-1 w-full sm:max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search audio tracks..."
              className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-purple-200/50 dark:border-purple-700/50 text-sm backdrop-blur transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 text-sm text-purple-600 dark:text-purple-400 py-8 animate-pulse">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading audio tracks...
        </div>
      )}
      {!isLoading && items.length > 0 && (
        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
          Found {items.length} audio track{items.length !== 1 ? 's' : ''}
        </div>
      )}

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
        <div className="text-center py-8">
          <p className="text-sm text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/50 px-4 py-3 rounded-lg inline-block">
            No audio tracks found. Try a different search term.
          </p>
        </div>
      )}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 z-50"
          aria-label="Back to top"
          title="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
