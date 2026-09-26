import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { OUTCOMES, type OutcomeCounts, type TrendRow } from '../home_functions';
import { ChartCard, ChartTooltip, Legend } from './chartParts';
import { AXIS_TICK, roundedTopPath } from './chartShapes';

// Space between stacked segments, drawn as surface (no strokes around marks)
const SEGMENT_GAP = 2;

type SegmentProps = { x?: number; y?: number; width?: number; height?: number; payload?: TrendRow };

// Only the topmost non-empty segment of a column gets the rounded data end; every segment
// sitting on another one leaves a surface gap below it
const segmentShape = (index: number) =>
  function Segment({ x = 0, y = 0, width = 0, height = 0, payload }: SegmentProps) {
    if (!payload || height <= 0) return null;
    const value = (key: keyof OutcomeCounts) => payload[key];
    const isTop = OUTCOMES.slice(index + 1).every((o) => value(o.key) === 0);
    const hasBelow = OUTCOMES.slice(0, index).some((o) => value(o.key) > 0);
    const drawnHeight = Math.max(0, height - (hasBelow ? SEGMENT_GAP : 0));
    if (drawnHeight <= 0) return null;
    const d = isTop
      ? roundedTopPath(x, y, width, drawnHeight)
      : `M${x},${y}h${width}v${drawnHeight}h${-width}Z`;
    return <path d={d} fill={OUTCOMES[index].color} />;
  };

const SHAPES = OUTCOMES.map((_, index) => segmentShape(index));

export function OutcomeTrendChart({
  id,
  rows,
  totals,
  bucketLabel,
  takeaway,
}: {
  id: string;
  rows: TrendRow[];
  totals: OutcomeCounts;
  bucketLabel: string;
  takeaway?: string;
}) {
  return (
    <ChartCard
      id={id}
      title={`How many appointments were there each ${bucketLabel}?`}
      subtitle={`Each bar is one ${bucketLabel}: the taller it is, the more appointments. The colors show what happened with them.`}
      takeaway={takeaway}
      legend={
        <>
          <Legend
            items={OUTCOMES.map((o) => ({ label: o.label, color: o.color, value: String(totals[o.key]) }))}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {OUTCOMES.map((o) => `${o.label}: ${o.meaning}`).join(' · ')}
          </p>
        </>
      }
      table={{
        columns: [bucketLabel[0].toUpperCase() + bucketLabel.slice(1), ...OUTCOMES.map((o) => o.label), 'Total'],
        rows: rows.map((row) => [row.label, ...OUTCOMES.map((o) => row[o.key]), row.total]),
      }}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: 'var(--viz-axis)' }}
              interval="preserveStartEnd"
              minTickGap={18}
            />
            <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} />
            <Tooltip
              cursor={{ fill: 'var(--viz-hover)' }}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as TrendRow | undefined;
                if (!active || !row) return null;
                return (
                  <ChartTooltip
                    title={`${row.label} · ${row.total} ${row.total === 1 ? 'appointment' : 'appointments'}`}
                    rows={[...OUTCOMES].reverse().map((o) => ({
                      label: o.label,
                      value: String(row[o.key]),
                      color: o.color,
                    }))}
                  />
                );
              }}
            />
            {OUTCOMES.map((o, index) => (
              <Bar
                key={o.key}
                dataKey={o.key}
                name={o.label}
                stackId="outcome"
                fill={o.color}
                maxBarSize={24}
                shape={SHAPES[index]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
