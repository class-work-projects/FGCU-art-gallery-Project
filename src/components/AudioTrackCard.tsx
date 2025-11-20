import { useEffect, useRef, useState } from 'react';
import { buildDownloadFileUrl } from '../api/dataverseClient';
import { motion } from 'framer-motion';

interface Props {
  fileId: string;
  title: string;
  description?: string;
  datasetPersistentId?: string;
  durationEstimate?: number; // seconds (if known)
  active?: boolean;
  onPlay: (id: string) => void;
  onPause: (id: string) => void;
}

export default function AudioTrackCard({ fileId, title, description, datasetPersistentId, durationEstimate, active, onPlay, onPause }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const timeHandler = () => setProgress(audio.currentTime);
    const loadedHandler = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', timeHandler);
    audio.addEventListener('loadedmetadata', loadedHandler);
    audio.addEventListener('waiting', () => setLoading(true));
    audio.addEventListener('playing', () => setLoading(false));
    return () => {
      audio.removeEventListener('timeupdate', timeHandler);
      audio.removeEventListener('loadedmetadata', loadedHandler);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (active) {
      audio.play().catch(() => {/* ignore */});
    } else {
      audio.pause();
      audio.currentTime = 0;
      setProgress(0);
    }
  }, [active]);

  const handleToggle = () => {
    if (active) {
      onPause(fileId);
    } else {
      onPlay(fileId);
    }
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-neutral-800/80 dark:to-purple-900/80 backdrop-blur rounded-xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 transition-all duration-300 hover:-translate-y-1 ${active ? 'ring-2 ring-purple-500' : ''}`}> 
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <button
            onClick={handleToggle}
            className="relative w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/30 dark:hover:shadow-purple-400/30 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label={active ? 'Pause' : 'Play'}
          >
            {loading ? (
              <span className="animate-pulse text-xs">...</span>
            ) : active ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 pl-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
            {description && <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">{description}</p>}
            <div className="mt-2">
              <div className="h-2.5 w-full bg-neutral-200/50 dark:bg-neutral-700/50 rounded-full overflow-hidden backdrop-blur">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 transition-all animate-shimmer" 
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mt-1">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration || durationEstimate)}</span>
              </div>
            </div>
          </div>
        </div>
        {datasetPersistentId && (
          <a 
            href={`https://dataverse.fgcu.edu/dataset.xhtml?persistentId=${datasetPersistentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 hover:shadow-md hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 transition-all duration-300 hover:-translate-y-0.5 group-hover:scale-105"
          >
            View Dataset
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        )}
      </div>
      <audio ref={audioRef} preload="metadata" src={buildDownloadFileUrl(fileId)} />
    </motion.div>
  );
}

function formatTime(seconds?: number | null) {
  if (seconds == null || !isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
