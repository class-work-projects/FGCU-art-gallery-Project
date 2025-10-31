import '@testing-library/jest-dom';

// Mock import.meta for Vite environment variables
(global as any).importMeta = {
  env: {
    VITE_DATAVERSE_BASE_URL: 'https://dataverse.fgcu.edu',
    VITE_DATAVERSE_API_TOKEN: undefined
  }
};

// Define import.meta globally for Jest
Object.defineProperty(global, 'import', {
  value: {
    meta: (global as any).importMeta
  }
});
