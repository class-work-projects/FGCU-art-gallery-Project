import { useState } from 'react';

export default function AdminPage() {
  const [message] = useState('Upload functionality requires API token with appropriate permissions.');

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <p className="text-sm text-neutral-500">This section will allow instructors or curators to upload new artwork (datasets/files) and edit metadata. For now this is a placeholder awaiting authentication design.</p>
      <div className="rounded border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400 dark:bg-amber-900/20 dark:text-amber-300 p-4 text-sm">
        {message}
      </div>
      <form className="grid gap-4">
        <input type="text" placeholder="Title" className="rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm" disabled />
        <textarea placeholder="Description" className="rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm min-h-[120px]" disabled />
        <input type="file" multiple className="text-sm" disabled />
        <button type="button" disabled className="rounded-md bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-4 py-2 text-sm font-medium cursor-not-allowed">Upload (Coming Soon)</button>
      </form>
    </div>
  );
}
