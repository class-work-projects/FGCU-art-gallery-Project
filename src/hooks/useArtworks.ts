import { useQuery } from '@tanstack/react-query';
import { searchArtworks } from '../api/dataverseClient';

export function useArtworks(query: string, filters: { fq?: string[] } = {}, enabled = true) {
  return useQuery({
    queryKey: ['artworks', 'images', query, filters],
    queryFn: () =>
      searchArtworks({
        q: query || '*',
        type: ['file'],
        per_page: 60,
        fq: [
          // Only published image files; adjust if needing drafts
          'fileContentType:image/*',
          ...(filters.fq || [])
        ]
      }),
    staleTime: 1000 * 60,
    enabled
  });
}
