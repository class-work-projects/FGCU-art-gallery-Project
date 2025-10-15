import { useQuery } from '@tanstack/react-query';
import { searchArtworks } from '../api/dataverseClient';

export function useAudio(query: string, filters: { fq?: string[] } = {}, enabled = true) {
  return useQuery({
    queryKey: ['audio', query, filters],
    queryFn: () =>
      searchArtworks({
        q: query || '*',
        type: ['file'],
        per_page: 50,
        fq: [
          'fileContentType:audio/*',
          ...(filters.fq || [])
        ]
      }),
    staleTime: 1000 * 60,
    enabled
  });
}
