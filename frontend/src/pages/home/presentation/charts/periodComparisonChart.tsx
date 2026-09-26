import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatPercent, OUTCOMES, type AppointmentMetrics, type OutcomeCounts } from '../home_functions';
import { ChartCard, ChartTooltip, Legend } from './chartParts';
import { CATEGORY_TICK, roundedRightPath } from './chartShapes';

const SEGMENT_GAP = 2;
const BAR_THICKNESS = 22;

type Row = OutcomeCounts & { label: string; total: number; attendanceRate: number | null };
type SegmentProps = { x?: number; y?: number; width?: number; height?: number; payload?: Row };

// Horizontal twin of the stacked columns: the last non-empty segment gets the rounded end,
// every segment after another one leaves a surface gap before it
const segmentShape = (index: number) =>
  function Segment({ x = 0, y = 0, width = 0, height = 0, payload }: SegmentProps) {
    if (!payload || width <= 0) return null;
    const isLast = OUTCOMES.slice(index + 1).every((o) => payload[o.key] === 0);
    const hasBefore = OUTCOMES.slice(0, index).some((o) => payload[o.key] > 0);
    const gap = hasBefore ? SEGMENT_GAP : 0;
    const drawnWidth = width - gap;
    if (drawnWidth <= 0) return null;
    const d = isLast
      ? roundedRightPath(x + gap, y, drawnWidth, height)
      : `M${x + gap},${y}h${drawnWidth}v${height}h${-drawnWidth}Z`;
    return <path d={d} fill={OUTCOMES[index].color} />;
  };

const SHAPES = OUTCOMES.map((_, index) => segmentShape(index));

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// This period against the one before, whole: supports the "compared with last month" sentence
export function PeriodComparisonChart({
  id,
  current,
  previous,
  currentName,
  previousName,
  takeaway,
}: {
  id: string;
  current: AppointmentMetrics;
  previous: AppointmentMetrics;
  currentName: string;
  previousName: string;
  takeaway?: string;
}) {
  const rows: Row[] = [
    { label: capitalize(currentName), total: current.total, attendanceRate: current.attendanceRate, ...current.outcomes },
    { label: capitalize(previousName), total: previous.total, attendanceRate: previous.attendanceRate, ...previous.outcomes },
  ];

  return (
    <ChartCard
      id={id}
      title={`How does it compare with ${previousName}?`}
      subtitle="Each bar is all the appointments of one period. A longer bar means more appointments; the colors show what happened with them."
      takeaway={takeaway}
      legend={<Legend items={OUTCOMES.map((o) => ({ label: o.label, color: o.color }))} />}
      table={{
        columns: ['Period', ...OUTCOMES.map((o) => o.label), 'Total', 'Patients who came'],
        rows: rows.map((row) => [row.label, ...OUTCOMES.map((o) => row[o.key]), row.total, formatPercent(row.attendanceRate)]),
      }}
    >
      {previous.total === 0 && current.total === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No appointments to compare</p>
      ) : (
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
              <XAxis type="number" hide domain={[0, 'dataMax']} />
              <YAxis
                type="category"
                dataKey="label"
                width={130}
                tick={CATEGORY_TICK}
                tickLine={false}
                axisLine={{ stroke: 'var(--viz-axis)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--viz-hover)' }}
                content={({ active, payload }) => {
                  const row = payload?.[0]?.payload as Row | undefined;
                  if (!active || !row) return null;
                  return (
                    <ChartTooltip
                      title={`${row.label} · ${row.total} appointments`}
                      rows={OUTCOMES.map((o) => ({ label: o.label, value: String(row[o.key]), color: o.color }))}
                    />
                  );
                }}
              />
              {OUTCOMES.map((o, index) => (
                <Bar
                  key={o.key}
                  dataKey={o.key}
                  stackId="outcome"
                  barSize={BAR_THICKNESS}
                  shape={SHAPES[index]}
                  isAnimationActive={false}
                  // The total at the tip of the whole bar, on the last series only
                  label={
                    index === OUTCOMES.length - 1
                      ? ({ x = 0, y = 0, width = 0, height = 0, index: rowIndex = 0 }) => (
                          <text
                            x={Number(x) + Number(width) + 6}
                            y={Number(y) + Number(height) / 2}
                            dominantBaseline="central"
                            fill="var(--muted-foreground)"
                            fontSize={12}
                          >
                            {rows[rowIndex].total}
                          </text>
                        )
                      : undefined
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
