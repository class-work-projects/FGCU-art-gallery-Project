import { useQuery } from '@tanstack/react-query';
import { searchArtworks, listDatasetFiles, buildDownloadFileUrl, getDataset } from '../api/dataverseClient';

interface ImageDataset {
  persistentId: string;
  title: string;
  description: string | undefined;
  representativeFileId: any;
  representativeThumb: string;
  representativeFull: string;
}

async function fetchImageDatasets(query: string, filters?: { fq?: string[] }): Promise<ImageDataset[]> {
  // 1. Search datasets
  const searchQuery = query ? `*${query}*` : '*';
  
  const data = await searchArtworks({
    q: searchQuery,
    type: ['dataset'],
    per_page: 50,
    show_facets: false,
    fq: filters?.fq
  });

  const datasets = data.items.filter((i: any) => i.type === 'dataset');
  
  // 2. Fetch all datasets in parallel instead of sequentially
  const results = await Promise.all(
    datasets.map(async (ds) => {
      const pid = (ds as any).global_id;
      try {
        // Fetch files and dataset metadata in parallel
        const [files, fullDataset] = await Promise.all([
          listDatasetFiles(pid),
          getDataset(pid).catch(() => null) // Don't fail if metadata fetch fails
        ]);
        
        // Find image files, excluding PDFs
        const image = (files || []).find((f: any) => {
          const ct = f.contentType || f.mimeType || f?.dataFile?.contentType;
          const filename = f.name || f.label || f?.dataFile?.filename || '';
          // Skip PDFs and only include actual image files
          return (ct || '').startsWith('image/') && !filename.toLowerCase().endsWith('.pdf');
        });
        
        if (!image) {
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('[useImageDatasets] No image in dataset', pid, files?.length);
          }
          return null; // Return null instead of continue
        }
        
        // Extract title from full dataset if available
        let title = ds.name;
        if (fullDataset) {
          const titleField = fullDataset?.latestVersion?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'title');
          if (titleField?.value) title = titleField.value;
        }
        
        return {
          persistentId: pid,
          title: title || ds.name || 'Untitled Dataset',
          description: ds.description,
          representativeFileId: image.dataFile?.id || image.id,
          representativeThumb: buildDownloadFileUrl(image.dataFile?.id || image.id, true),
          representativeFull: buildDownloadFileUrl(image.dataFile?.id || image.id, false)
        };
      } catch (err) {
        // Ignore dataset errors
        return null;
      }
    })
  );
  
  // Filter out null results (datasets without images or with errors)
  return results.filter((r): r is ImageDataset => r !== null);
}

export function useImageDatasets(query: string, filters?: { fq?: string[] }) {
  return useQuery({
    queryKey: ['imageDatasets', query, filters],
    queryFn: () => fetchImageDatasets(query, filters),
    staleTime: 1000 * 60
  });
}
