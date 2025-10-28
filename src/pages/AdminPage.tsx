import { useState, useRef } from 'react';

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<'upload' | 'manage'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' }>({
    text: 'This is a mock upload flow for demonstration purposes.',
    type: 'info'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-8 -mx-6 animate-pulse-glow">
        <div className="absolute inset-0 bg-grid-neutral-700/[0.2] [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-neutral-200/[0.2] animate-shimmer" />
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-float">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl text-lg font-light leading-relaxed">
            Manage your art gallery content and upload new artwork. This dashboard provides tools for curators and instructors.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setSelectedTab('upload')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
            selectedTab === 'upload'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          Upload Artwork
        </button>
        <button
          onClick={() => setSelectedTab('manage')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
            selectedTab === 'manage'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          Manage Collection
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {selectedTab === 'upload' ? (
          <div className="space-y-6 max-w-xl">
            <div className="rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-800 dark:text-amber-300 p-4 text-sm animate-pulse-glow">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  {message.type === 'error' ? (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  ) : message.type === 'success' ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{message.text}</span>
              </div>
            </div>
            
            <form className="space-y-6 animate-slide-in">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Artwork Title</label>
                <input
                  type="text"
                  placeholder="Enter artwork title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-purple-200/50 dark:border-purple-700/50 text-sm backdrop-blur transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea
                  placeholder="Enter artwork description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-purple-200/50 dark:border-purple-700/50 text-sm backdrop-blur transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Upload Files</label>
                <div className="flex items-center justify-center w-full">
                  <label 
                    className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-purple-200/50 dark:border-purple-700/50 bg-white/50 dark:bg-neutral-800/50 backdrop-blur cursor-pointer transition-all duration-300 ${
                      preview ? 'border-purple-500 dark:border-purple-400' : ''
                    }`}
                  >
                    {preview ? (
                      <div className="relative w-full h-full">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                            setPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        <svg className="w-8 h-8 mb-4 text-purple-500/70 dark:text-purple-400/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-purple-500/70 dark:text-purple-400/70">
                          {file ? file.name : 'Drag & drop files here'}
                        </p>
                        <p className="text-xs text-neutral-500">PNG, JPG, MP3, or MP4 (max 10MB)</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,audio/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          if (selectedFile.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (e) => setPreview(e.target?.result as string);
                            reader.readAsDataURL(selectedFile);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={!title || !description || !file || isUploading}
                onClick={async () => {
                  setIsUploading(true);
                  setMessage({ text: 'Uploading...', type: 'info' });
                  
                  // Simulate upload delay
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  setIsUploading(false);
                  setMessage({ text: 'Upload successful! (This is a mock upload)', type: 'success' });
                  
                  // Reset form
                  setTitle('');
                  setDescription('');
                  setFile(null);
                  setPreview(null);
                  
                  // Simulate success state reset
                  setTimeout(() => {
                    setMessage({
                      text: 'This is a mock upload flow for demonstration purposes.',
                      type: 'info'
                    });
                  }, 3000);
                }}
                className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-purple-500/30 dark:hover:shadow-purple-400/30 transform hover:scale-[1.02] transition-all duration-300 ${
                  (!title || !description || !file || isUploading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload Artwork'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-in">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative group bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-neutral-800/80 dark:to-purple-900/80 backdrop-blur rounded-xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                  <div className="p-4">
                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="mt-2 h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
