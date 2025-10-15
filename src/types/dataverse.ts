export interface DataverseSearchItemBase {
  name: string;
  type: 'dataverse' | 'dataset' | 'file';
  description?: string;
  published_at?: string;
}

export interface DataverseSearchFileItem extends DataverseSearchItemBase {
  type: 'file';
  file_id: string;
  file_type?: string;
  file_content_type?: string;
  dataset_id?: string;
  dataset_persistent_id?: string;
  file_persistent_id?: string;
  image_url?: string; // thumbnail
}

export interface DataverseSearchDatasetItem extends DataverseSearchItemBase {
  type: 'dataset';
  global_id: string;
  identifier_of_dataverse?: string;
  name_of_dataverse?: string;
  citation?: string;
  storageIdentifier?: string;
  fileCount?: number;
  versionState?: string;
  subjects?: string[];
  authors?: string[];
}

export interface DataverseSearchResponse {
  status: string;
  data: {
    q: string;
    total_count: number;
    start: number;
    items: (DataverseSearchFileItem | DataverseSearchDatasetItem | DataverseSearchItemBase)[];
    count_in_response: number;
  };
}

export interface ArtworkMetadata {
  id: string; // dataset or file id
  title: string;
  description?: string;
  authors?: string[];
  subjects?: string[];
  fileCount?: number;
  thumbnailUrl?: string;
  datasetPersistentId?: string;
  filePersistentId?: string;
  fileContentType?: string;
}
