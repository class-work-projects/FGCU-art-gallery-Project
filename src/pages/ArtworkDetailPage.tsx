import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDataset, listDatasetFiles, buildDownloadFileUrl } from '../api/dataverseClient';

export default function ArtworkDetailPage() {
  const { id } = useParams();
  const pid = decodeURIComponent(id || '');

  const datasetQuery = useQuery({
    queryKey: ['dataset', pid],
    queryFn: () => getDataset(pid),
    enabled: !!pid
  });

  const filesQuery = useQuery({
    queryKey: ['files', pid],
    queryFn: () => listDatasetFiles(pid),
    enabled: !!pid
  });

  const dataset = datasetQuery.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{extractTitle(dataset)}</h1>
        <p className="text-neutral-500 max-w-3xl text-sm whitespace-pre-line">{extractDescription(dataset)}</p>
        <div className="text-xs text-neutral-400 flex flex-wrap gap-2">
          {extractAuthors(dataset)?.map((a: string) => (
            <span key={a} className="inline-flex items-center rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-1">
              {a}
            </span>
          ))}
        </div>
        <div>
          <a
            href={`https://doi.org/${pid.replace('doi:', '')}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline hover:text-brand-600"
          >
            View DOI Record
          </a>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Files</h2>
        {filesQuery.isLoading && <div className="text-sm text-neutral-500">Loading files...</div>}
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {filesQuery.data?.map((file: any) => (
            <li key={file.dataFile?.id} className="border border-neutral-200 dark:border-neutral-700 rounded p-3 flex flex-col gap-2 bg-white dark:bg-neutral-800">
              <div className="text-sm font-medium line-clamp-1" title={file.label}>{file.label}</div>
              <div className="text-[11px] uppercase tracking-wide text-neutral-400">{file.dataFile?.contentType}</div>
              <div className="flex gap-2 mt-auto">
                <a
                  href={buildDownloadFileUrl(file.dataFile?.id)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
                {file.dataFile?.contentType?.startsWith('image/') && (
                  <a
                    href={buildDownloadFileUrl(file.dataFile?.id)}
                    className="text-xs text-neutral-500 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Image
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function extractTitle(dataset: any) {
  return dataset?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'title')?.value || dataset?.title || 'Untitled';
}

function extractDescription(dataset: any) {
  return dataset?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'dsDescription')?.value?.[0]?.dsDescriptionValue?.value;
}

function extractAuthors(dataset: any) {
  const field = dataset?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'author');
  return field?.value?.map((v: any) => v.authorName?.value).filter(Boolean);
}
