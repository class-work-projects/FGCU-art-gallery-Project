import axios from 'axios';
import { DataverseSearchResponse, ArtworkMetadata } from '../types/dataverse';

// Check if we should use backend proxy or connect directly to Dataverse
const USE_BACKEND = (import.meta as any).env?.VITE_USE_BACKEND === 'true';
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
const DATAVERSE_BASE_URL = (import.meta as any).env?.VITE_DATAVERSE_BASE_URL || 'https://dataverse.fgcu.edu';

// Use backend proxy or direct Dataverse API
const BASE_URL = USE_BACKEND ? API_BASE_URL : `${DATAVERSE_BASE_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface SearchParams {
  q: string;
  type?: ('dataset' | 'file')[];
  start?: number;
  per_page?: number;
  subtree?: string; // restrict to specific collection alias
  show_facets?: boolean;
  fq?: string[]; // filter queries
  metadata_fields?: string[]; // request extra metadata
  show_hidden?: boolean; // include unpublished/draft content
}

export async function searchArtworks(params: SearchParams): Promise<DataverseSearchResponse['data']> {
  const response = await api.get<DataverseSearchResponse>('/search', {
    params: {
      ...params,
      type: params.type,
      show_facets: params.show_facets ?? false,
      metadata_fields: params.metadata_fields
    },
  });
  return response.data.data;
}

// Get dataset JSON
export async function getDataset(persistentId: string) {
  const response = await api.get(`/datasets/:persistentId/versions/:latest`, {
    params: { persistentId }
  });
  return response.data.data;
}

// Batch fetch dataset titles given a set of persistent IDs (sequential to respect rate limits)
export async function getDatasetTitles(persistentIds: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const pid of Array.from(new Set(persistentIds))) {
    try {
      const ds = await getDataset(pid);
      const titleField = ds?.latestVersion?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'title');
      map[pid] = titleField?.value || ds?.latestVersion?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'title')?.value || 'Untitled';
    } catch {
      map[pid] = 'Untitled';
    }
  }
  return map;
}

export async function listDatasetFiles(datasetIdOrPid: string, version = ':latest') {
  const isPid = datasetIdOrPid.startsWith('doi:') || datasetIdOrPid.startsWith('hdl:');
  // Correct REST paths:
  // By persistentId: /datasets/:persistentId/versions/:latest/files?persistentId=doi:... 
  // By numeric id:   /datasets/{id}/versions/:latest/files
  const path = isPid
    ? `/datasets/:persistentId/versions/${version}/files`
    : `/datasets/${datasetIdOrPid}/versions/${version}/files`;
  const response = await api.get(path, {
    params: isPid ? { persistentId: datasetIdOrPid } : undefined
  });
  return response.data.data || response.data;
}

export function buildDownloadFileUrl(fileId: string | number, thumbnail = false) {
  // Use backend proxy or direct Dataverse URL based on configuration
  const base = USE_BACKEND 
    ? `${API_BASE_URL}/access/datafile/${fileId}`
    : `${DATAVERSE_BASE_URL}/api/access/datafile/${fileId}`;
  return thumbnail ? `${base}?imageThumb=true` : base;
}

export function isImageFile(item: any): boolean {
  return (item.file_content_type || '').startsWith('image/');
}

export async function getFileMetadata(fileId: string | number) {
  const response = await api.get(`/files/${fileId}`);
  return response.data.data;
}

export async function mapDatasetToArtwork(dataset: any): Promise<ArtworkMetadata> {
  const latest = dataset;
  return {
    id: String(latest.id || latest.datasetId || latest.datasetPersistentId || latest.identifier),
    title: latest?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'title')?.value || latest.name || 'Untitled',
    description: latest?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === 'dsDescription')?.value?.[0]?.dsDescriptionValue?.value,
    authors: extractCompoundValues(latest, 'author', 'authorName'),
    subjects: extractPrimitiveArray(latest, 'subject'),
    fileCount: latest.files?.length || latest.fileCount,
    datasetPersistentId: latest.datasetPersistentId || latest.datasetPersistentId || latest.persistentId,
    thumbnailUrl: undefined,
  };
}

function extractCompoundValues(dataset: any, fieldType: string, subField: string): string[] | undefined {
  try {
    const field = dataset?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === fieldType);
    if (!field) return undefined;
    return (field.value || []).map((v: any) => v?.[subField]?.value).filter(Boolean);
  } catch {
    return undefined;
  }
}

function extractPrimitiveArray(dataset: any, fieldType: string): string[] | undefined {
  try {
    const field = dataset?.metadataBlocks?.citation?.fields?.find((f: any) => f.typeName === fieldType);
    if (!field) return undefined;
    return field.value as string[];
  } catch {
    return undefined;
  }
}
