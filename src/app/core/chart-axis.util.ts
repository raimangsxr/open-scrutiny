/** Tick labels on the vote axis: step 1 while few votes, then 2, 3, … so labels do not overlap. */
export function computeYAxisTicks(maxValue: number, maxLabels = 12): number[] {
  const ceiling = Math.max(1, Math.ceil(maxValue));
  let step = 1;
  while (Math.ceil(ceiling / step) + 1 > maxLabels) {
    step += 1;
  }
  const yMax = Math.ceil(ceiling / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += step) {
    ticks.push(v);
  }
  return ticks;
}

/** Max characters per x-axis band label before ngx-charts wraps to another line. */
export function maxCharsPerBand(
  chartWidthPx: number,
  bandCount: number,
  charWidthPx = 7
): number {
  if (bandCount <= 0 || chartWidthPx <= 0) {
    return 6;
  }
  const bandwidth = chartWidthPx / bandCount;
  return Math.max(3, Math.floor(bandwidth / charWidthPx));
}
