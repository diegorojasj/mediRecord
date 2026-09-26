import { BarChart3, Lightbulb, Table2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TableView = { columns: string[]; rows: (string | number)[][] };

// A chart with its title, legend and a table twin: every value is readable without hovering
export function ChartCard({
  id,
  title,
  subtitle,
  takeaway,
  legend,
  table,
  className,
  children,
}: {
  // Anchor the "In short" sentences link to
  id?: string;
  title: string;
  // How to read the chart, in one plain sentence
  subtitle?: string;
  // What the chart shows, said in words, so nobody has to decode it
  takeaway?: string;
  legend?: ReactNode;
  table?: TableView;
  className?: string;
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section
      id={id}
      className={cn('flex min-w-0 scroll-mt-4 flex-col rounded-md border bg-card p-4 text-card-foreground', className)}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="!m-0 !font-sans !text-sm !font-semibold !leading-snug !tracking-normal !text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {table && (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            aria-pressed={showTable}
            onClick={() => setShowTable((value) => !value)}
          >
            {showTable ? <BarChart3 className="size-3.5" /> : <Table2 className="size-3.5" />}
            {showTable ? 'See chart' : 'See numbers'}
          </button>
        )}
      </header>
      {takeaway && (
        <p className="mb-3 flex items-start gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs text-foreground">
          <Lightbulb className="mt-px size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span>{takeaway}</span>
        </p>
      )}
      {legend && !showTable && <div className="mb-2">{legend}</div>}
      {showTable && table ? <DataTable table={table} /> : children}
    </section>
  );
}

function DataTable({ table }: { table: TableView }) {
  return (
    <div className="max-h-72 overflow-auto rounded border">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 bg-muted">
          <tr>
            {table.columns.map((column, index) => (
              <th
                key={column}
                scope="col"
                className={cn('px-2 py-1.5 font-medium text-muted-foreground', index === 0 ? 'text-left' : 'text-right')}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={cn('px-2 py-1 text-foreground', index === 0 ? 'text-left' : 'text-right tabular-nums')}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Legend swatches mirror the mark: a rounded rect for bars
export function Legend({ items }: { items: { label: string; color: string; value?: string }[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2.5 shrink-0 rounded-sm" style={{ background: item.color }} />
          <span>{item.label}</span>
          {item.value && <span className="font-medium text-foreground">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}

// Values lead, labels follow; each row keyed by a short stroke of its color
export function ChartTooltip({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string; color?: string }[];
}) {
  return (
    <div className="min-w-36 rounded-md border bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium text-muted-foreground">{title}</p>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            {row.color && <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: row.color }} />}
            <span className="font-semibold tabular-nums text-foreground">{row.value}</span>
            <span className="text-muted-foreground">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
