'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
}

interface Props {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
  maxResults?: number;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  disabled = false,
  emptyMessage = 'Sin coincidencias',
  className,
  maxResults = 80,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return options.slice(0, maxResults);

    return options
      .filter((o) => {
        const haystack = normalize(
          [o.label, o.description, o.keywords].filter(Boolean).join(' '),
        );
        return haystack.includes(q);
      })
      .slice(0, maxResults);
  }, [options, query, maxResults]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className={cn('relative min-w-0', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs',
          'hover:bg-accent/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        title={selected?.label}
      >
        <span className={cn('truncate text-left', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-[12rem] rounded-xl border bg-white shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 h-9"
              />
              {query && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setQuery('')}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-slate-500">{emptyMessage}</li>
            ) : (
              filtered.map((o) => {
                const active = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50',
                        active && 'bg-rose-50/60',
                      )}
                      onClick={() => handleSelect(o.value)}
                      title={o.label}
                    >
                      <Check
                        className={cn(
                          'mt-0.5 size-4 shrink-0 text-rose-600',
                          active ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{o.label}</span>
                        {o.description && (
                          <span className="block truncate text-xs text-slate-500">
                            {o.description}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {options.length > maxResults && !query && (
            <p className="border-t px-3 py-2 text-[11px] text-slate-400">
              Escriba para filtrar entre {options.length} opciones
            </p>
          )}
        </div>
      )}
    </div>
  );
}
