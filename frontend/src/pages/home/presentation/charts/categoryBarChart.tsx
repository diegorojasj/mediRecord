import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryRow } from '../home_functions';
import { ChartCard, ChartTooltip } from './chartParts';
import { AXIS_TICK, CATEGORY_TICK, roundedRightPath, roundedTopPath } from './chartShapes';

const BAR_THICKNESS = 16;
const ROW_HEIGHT = 30;

type BarShapeProps = { x?: number; y?: number; width?: number; height?: number };

const HorizontalBar = ({ x = 0, y = 0, width = 0, height = 0 }: BarShapeProps) => (
  <path d={roundedRightPath(x, y, width, height)} fill="var(--series-1)" />
);
const VerticalBar = ({ x = 0, y = 0, width = 0, height = 0 }: BarShapeProps) => (
  <path d={roundedTopPath(x, y, width, height)} fill="var(--series-1)" />
);

// One series, one color: the categories are compared by length, never by hue
export function CategoryBarChart({
  title,
  subtitle,
  takeaway,
  rows,
  valueLabel,
  orientation = 'horizontal',
  labelWidth = 120,
  limit,
  emptyMessage = 'No data in this period',
}: {
  title: string;
  subtitle?: string;
  takeaway?: string;
  rows: CategoryRow[];
  valueLabel: string;
  orientation?: 'horizontal' | 'vertical';
  labelWidth?: number;
  // Long tails show their largest rows; the rest are summed in a note and kept in the table.
  // An "Other" bar would dwarf the rows when the tail is most of the data
  limit?: number;
  emptyMessage?: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const shown = limit ? rows.slice(0, limit) : rows;
  const hidden = rows.slice(shown.length);
  const hiddenTotal = hidden.reduce((sum, row) => sum + row.value, 0);
  const share = (value: number) => (total > 0 ? `${Math.round((value / total) * 100)}%` : '—');
  const table = {
    columns: ['', valueLabel, 'Share'],
    rows: rows.map((row) => [row.label, row.value, share(row.value)]),
  };
  const tooltip = (
    <Tooltip
      cursor={{ fill: 'var(--viz-hover)' }}
      content={({ active, payload }) => {
        const row = payload?.[0]?.payload as CategoryRow | undefined;
        if (!active || !row) return null;
        return (
          <ChartTooltip
            title={row.label}
            rows={[
              {
                // "1 patient", "2 patients": the value labels are plural nouns
                label: row.value === 1 ? valueLabel.toLowerCase().replace(/s$/, '') : valueLabel.toLowerCase(),
                value: String(row.value),
                color: 'var(--series-1)',
              },
              { label: 'of the total', value: share(row.value) },
            ]}
          />
        );
      }}
    />
  );

  return (
    <ChartCard title={title} subtitle={subtitle} takeaway={takeaway} table={table}>
      {total === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">{emptyMessage}</p>
      ) : orientation === 'horizontal' ? (
        <div style={{ height: shown.length * ROW_HEIGHT + 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shown} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }}>
              <XAxis type="number" hide domain={[0, 'dataMax']} />
              <YAxis
                type="category"
                dataKey="label"
                width={labelWidth}
                tick={CATEGORY_TICK}
                tickLine={false}
                axisLine={{ stroke: 'var(--viz-axis)' }}
                interval={0}
              />
              {tooltip}
              <Bar dataKey="value" barSize={BAR_THICKNESS} shape={HorizontalBar} isAnimationActive={false}>
                <LabelList dataKey="value" position="right" offset={6} fill="var(--muted-foreground)" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shown} margin={{ top: 18, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--viz-axis)' }} interval={0} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} />
              {tooltip}
              <Bar dataKey="value" maxBarSize={24} shape={VerticalBar} isAnimationActive={false}>
                <LabelList dataKey="value" position="top" offset={6} fill="var(--muted-foreground)" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {total > 0 && hidden.length > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Showing the top {shown.length}. The other {hidden.length} have {hiddenTotal} {valueLabel.toLowerCase()} ({share(hiddenTotal)}) — press “See numbers” for the full list.
        </p>
      )}
    </ChartCard>
  );
}
