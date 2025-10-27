import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  id: string;
  title: string;
  description?: string;
  authors?: string[];
  thumbnailUrl?: string;
  /** Optional higher quality source to swap in after initial thumb load */
  fullImageUrl?: string;
  fileCount?: number;
  datasetPersistentId?: string;
  image?: boolean;
  linkTo?: string; // internal route (legacy)
  externalHref?: string; // direct dataverse link
}

export default function ArtworkCard({ id, title, description, authors, thumbnailUrl, fullImageUrl, fileCount, datasetPersistentId, image, linkTo, externalHref }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200/70 dark:border-neutral-700/70 shadow-sm hover:shadow-lg transition-all flex flex-col backdrop-blur-sm"
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)] mix-blend-overlay" />
      {externalHref ? (
        <a href={externalHref} target="_blank" rel="noopener noreferrer" className="flex flex-col flex-1">
          {renderInner()}
        </a>
      ) : (
        <Link to={linkTo || `/artwork/${encodeURIComponent(datasetPersistentId || id)}`} className="flex flex-col flex-1">
          {renderInner()}
        </Link>
      )}
    </motion.div>
  );

  function renderInner() {
    return (
      <>
        <div className="aspect-[4/3] relative overflow-hidden bg-neutral-200 dark:bg-neutral-700">
          <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700" aria-hidden={!thumbnailUrl} style={{ display: thumbnailUrl ? 'none' : 'block' }} />
          {thumbnailUrl ? (
            <ProgressiveImage
              alt={title}
              thumb={thumbnailUrl}
              full={fullImageUrl}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs tracking-wide uppercase">
              {image ? 'Loading' : 'No Preview'}
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.55),rgba(0,0,0,0)_55%)] opacity-0 group-hover:opacity-70 transition-opacity" />
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 min-h-[2.5rem] tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{title}</h3>
          {authors?.length && (
            <p className="text-xs text-neutral-500 line-clamp-1">{authors.slice(0, 3).join(', ')}</p>
          )}
          {description && (
            <p className="text-xs text-neutral-500 line-clamp-3 flex-1">{description}</p>
          )}
          {typeof fileCount === 'number' && fileCount > 0 && (
            <div className="mt-2 text-[10px] uppercase tracking-wide text-neutral-400">{fileCount} file{fileCount === 1 ? '' : 's'}</div>
          )}
        </div>
      </>
    );
  }
}

interface ProgressiveImageProps {
  thumb: string;
  full?: string;
  alt: string;
}

function ProgressiveImage({ thumb, full, alt }: ProgressiveImageProps) {
  const id = `img-${Math.random().toString(36).slice(2)}`;
  return (
    <img
      id={id}
      src={thumb}
      data-full={full}
      alt={alt}
      className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-[1.03] will-change-transform blur-[1.5px] contrast-110 saturate-125"
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        // Preload full image if provided
        const fullSrc = el.dataset.full;
        if (fullSrc) {
          const hi = new Image();
          hi.src = fullSrc;
          hi.onload = () => {
            el.src = fullSrc;
            el.classList.remove('blur-[1.5px]', 'contrast-110', 'saturate-125');
          };
        } else {
            el.classList.remove('blur-[1.5px]','contrast-110','saturate-125');
        }
      }}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (!el.dataset.attempt) {
          el.dataset.attempt = '1';
          if (el.src.includes('imageThumb=true')) {
            el.src = el.src.replace('imageThumb=true', 'imageThumb=preview');
          }
        } else if (el.dataset.attempt === '1') {
          el.dataset.attempt = '2';
          if (el.src.includes('imageThumb=')) {
            el.src = el.src.split('?')[0];
          }
        }
      }}
    />
  );
}
