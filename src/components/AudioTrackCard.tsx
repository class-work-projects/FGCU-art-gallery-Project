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
    <motion.div layout className={`group bg-white/60 dark:bg-neutral-800/60 backdrop-blur rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm hover:shadow-md transition-colors ${active ? 'ring-2 ring-brand-500' : ''}`}> 
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <button
            onClick={handleToggle}
            className="relative w-12 h-12 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
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
              <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mt-1">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration || durationEstimate)}</span>
              </div>
            </div>
          </div>
        </div>
        {datasetPersistentId && (
          <a href={`#/artwork/${encodeURIComponent(datasetPersistentId)}`} className="text-[10px] font-medium text-brand-600 dark:text-brand-400 hover:underline">View Dataset</a>
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
