import { useEffect, useState } from 'react';
const SUBJECTS = [
  'Painting',
  'Sculpture',
  'Photography',
  'Digital Art',
  'Installation',
  'Drawing',
  'Mixed Media'
];

const DATE_RANGES = [
  { label: 'Last 30 days', value: '[NOW-30DAYS TO *]' },
  { label: 'Last 6 months', value: '[NOW-6MONTHS TO *]' },
  { label: 'Last year', value: '[NOW-1YEAR TO *]' },
  { label: 'Custom date range', value: 'custom' }
];

type Mode = 'none' | 'subject' | 'author' | 'date' | 'custom';

interface Filter {
  type: string;
  value: string;
  label?: string;
}

export default function FilterSelector({
  onChange
}: {
  onChange: (filters: { fq?: string[] } | undefined) => void;
}) {
  const [mode, setMode] = useState<Mode>('none');
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [value, setValue] = useState('');
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  // Update filters when mode or value changes
  useEffect(() => {
    buildAndEmit();
  }, [mode, value, activeFilters, dateRange]);

  function buildAndEmit() {
    if (activeFilters.length === 0 && mode === 'none') {
      onChange(undefined);
      return;
    }

    const fq = [...activeFilters.map(buildFilterQuery)];
    
    // Add current filter if it exists
    if (mode !== 'none' && value.trim()) {
      if (mode === 'custom') {
        // Custom fq queries separated by newlines or commas
        const parts = value.split(/[,\n]+/).map((p) => p.trim()).filter(Boolean);
        fq.push(...parts);
      } else if (mode === 'date') {
        if (dateRange.start || dateRange.end) {
          const start = dateRange.start || '*';
          const end = dateRange.end || '*';
          fq.push(`publicationDate:[${start} TO ${end}]`);
        }
      } else {
        // subject or author
        const key = mode === 'subject' ? 'subject' : 'author';
        const val = value.includes(' ') ? `"${value}"` : value;
        fq.push(`${key}:${val}`);
      }
    }

    onChange({ fq: fq.filter(Boolean) });
  }

  function buildFilterQuery(filter: Filter): string {
    if (filter.type === 'date') {
      return `publicationDate:${filter.value}`;
    }
    return `${filter.type}:${filter.value.includes(' ') ? `"${filter.value}"` : filter.value}`;
  }

  function addFilter() {
    if (!value.trim() || mode === 'none') return;
    
    const newFilter: Filter = {
      type: mode === 'subject' ? 'subject' : mode === 'author' ? 'author' : 'custom',
      value: value.trim(),
      label: value.trim()
    };
    
    setActiveFilters(prev => [...prev, newFilter]);
    setValue('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Filter by:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 text-sm shadow-sm transition-shadow duration-200 hover:shadow-md focus-ring"
          >
            <option value="none">Select type...</option>
            <option value="subject">Subject</option>
            <option value="author">Author</option>
            <option value="date">Date</option>
            <option value="custom">Custom Query</option>
          </select>
        </div>

        {mode === 'subject' && (
          <div className="flex items-center gap-2">
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 text-sm shadow-sm transition-shadow duration-200 hover:shadow-md focus-ring"
            >
              <option value="">Select subject...</option>
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addFilter}
              className="rounded-lg px-3 py-2 text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors focus-ring"
            >
              Add
            </button>
          </div>
        )}

        {mode === 'date' && (
          <div className="flex items-center gap-2">
            <select
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (e.target.value !== 'custom') {
                  setDateRange({});
                }
              }}
              className="rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 text-sm shadow-sm transition-shadow duration-200 hover:shadow-md focus-ring"
            >
              <option value="">Select range...</option>
              {DATE_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            {value === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 text-sm"
                />
                <span>to</span>
                <input
                  type="date"
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 text-sm"
                />
              </div>
            )}
            <button
              type="button"
              onClick={addFilter}
              className="rounded-lg px-3 py-2 text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors focus-ring"
            >
              Add
            </button>
          </div>
        )}

        {(mode === 'author' || mode === 'custom') && (
          <div className="flex items-center gap-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === 'custom' ? 'e.g. subject:Painting' : `Enter ${mode} name`}
              className="rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur px-3 py-2 text-sm w-64 shadow-sm transition-shadow duration-200 hover:shadow-md focus-ring"
            />
            <button
              type="button"
              onClick={addFilter}
              className="rounded-lg px-3 py-2 text-sm bg-brand-500 text-white hover:bg-brand-600 transition-colors focus-ring"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-sm"
            >
              <span className="font-medium">{filter.type}:</span> {filter.label || filter.value}
              <button
                type="button"
                onClick={() => {
                  setActiveFilters(prev => prev.filter((_, i) => i !== index));
                }}
                className="ml-1 hover:text-brand-900 dark:hover:text-brand-100"
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => {
              setActiveFilters([]);
              setMode('none');
              setValue('');
              onChange(undefined);
            }}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
