// Mark geometry and axis styles shared by the dashboard charts

// Column with a 4px rounded data end and a square base
export function roundedTopPath(x: number, y: number, width: number, height: number, radius = 4) {
  if (height <= 0 || width <= 0) return '';
  const r = Math.min(radius, width / 2, height);
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`;
}

// Bar growing right from the axis: rounded end on the right
export function roundedRightPath(x: number, y: number, width: number, height: number, radius = 4) {
  if (height <= 0 || width <= 0) return '';
  const r = Math.min(radius, height / 2, width);
  return `M${x},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height - r}Q${x + width},${y + height} ${x + width - r},${y + height}H${x}Z`;
}

export const AXIS_TICK = { fill: 'var(--viz-muted)', fontSize: 11 };
export const CATEGORY_TICK = { fill: 'var(--muted-foreground)', fontSize: 12 };
