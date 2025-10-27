import { useQuery } from '@tanstack/react-query';
import { searchArtworks, listDatasetFiles, buildDownloadFileUrl, getDataset } from '../api/dataverseClient';

interface ImageDataset {
  persistentId: string;
  title: string;
  description?: string;
  representativeFileId?: string;
  representativeThumb?: string;
  representativeFull?: string;
}

async function fetchImageDatasets(query: string, filters?: { fq?: string[] }): Promise<ImageDataset[]> {
  // 1. Search datasets
  const data = await searchArtworks({
    q: query || '*',
    type: ['dataset'],
    per_page: 50,
    show_facets: false,
    fq: filters?.fq
  });

  const datasets = data.items.filter((i: any) => i.type === 'dataset');
  const results: ImageDataset[] = [];
  for (const ds of datasets) {
    const pid = (ds as any).global_id;
    try {
      const files = await listDatasetFiles(pid);
      const image = (files || []).find((f: any) => {
        const ct = f.contentType || f.mimeType || f?.dataFile?.contentType;
        return (ct || '').startsWith('image/');
      });
      if (!image) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.debug('[useImageDatasets] No image in dataset', pid, files?.length);
        }
        continue; // skip datasets without image files
      }
      // fetch dataset to extract richer description/title if needed
      let title = ds.name;
      try {
        const full = await getDataset(pid);
        const titleField = full?.latestVersion?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'title');
        if (titleField?.value) title = titleField.value;
      } catch {/* ignore */}
      results.push({
        persistentId: pid,
        title: title || ds.name || 'Untitled Dataset',
        description: ds.description,
        representativeFileId: image.dataFile?.id || image.id,
        representativeThumb: buildDownloadFileUrl(image.dataFile?.id || image.id, true),
        representativeFull: buildDownloadFileUrl(image.dataFile?.id || image.id, false)
      });
    } catch {/* ignore dataset errors */}
  }
  return results;
}

export function useImageDatasets(query: string, filters?: { fq?: string[] }) {
  return useQuery({
    queryKey: ['imageDatasets', query, filters],
    queryFn: () => fetchImageDatasets(query, filters),
    staleTime: 1000 * 60
  });
}
