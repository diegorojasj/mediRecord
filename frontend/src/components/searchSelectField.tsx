import { Tick02Icon, UnfoldMoreIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Popover } from 'radix-ui';
import { useRef, useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type SearchSelectOption = {
  value: string;
  label: string;
  description?: string;
  // Extra text matched by the search but not displayed (e.g. national ID)
  keywords?: string;
};

// Select with a search box, for long lists coming from the database (patients, doctors)
export function SearchSelectField({
  id,
  label,
  placeholder,
  emptyMessage = 'No results',
  loading,
  options,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  options: SearchSelectOption[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Dialog / sheet the field lives in; undefined outside of them (portals to <body>)
  const [container, setContainer] = useState<HTMLElement | undefined>();

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) =>
        [o.label, o.description, o.keywords].some((text) => text?.toLowerCase().includes(q)),
      )
    : options;

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setContainer(triggerRef.current?.closest<HTMLElement>('[role="dialog"]') ?? undefined);
    }
    setOpen(isOpen);
    if (!isOpen) setQuery('');
  };

  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex h-auto min-h-7 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-input/20 px-2 py-1 text-left text-xs/relaxed transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30 dark:hover:bg-input/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selected ? (
              <span className="min-w-0">
                <span className="block truncate text-foreground">{selected.label}</span>
                {selected.description && (
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {selected.description}
                  </span>
                )}
              </span>
            ) : (
              <span className="truncate text-muted-foreground">
                {loading ? 'Loading…' : (placeholder ?? `Select ${label.toLowerCase()}`)}
              </span>
            )}
            <HugeiconsIcon
              icon={UnfoldMoreIcon}
              strokeWidth={2}
              className="size-3.5 shrink-0 text-muted-foreground"
            />
          </button>
        </Popover.Trigger>
        {/*
          Portaled into the dialog / sheet itself rather than rendered in place:
          - staying inside the dialog keeps its focus trap and scroll lock from blocking the list
          - leaving the field's ancestors avoids containers like FieldGroup (`@container`, i.e.
            container-type), which become the containing block of the fixed-position popover
            without floating-ui noticing, so the list was drawn far away from its trigger
        */}
        <Popover.Portal container={container}>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="z-50 w-(--radix-popover-trigger-width) min-w-56 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          >
            <Input
              autoFocus
              type="search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mb-1"
            />
            <div role="listbox" className="max-h-60 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  {loading ? 'Loading…' : emptyMessage}
                </p>
              )}
              {filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    onOpenChange(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                    o.value === value && 'bg-muted/60',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{o.label}</span>
                    {o.description && (
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {o.description}
                      </span>
                    )}
                  </span>
                  {o.value === value && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={2}
                      className="size-3.5 shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Field>
  );
}
