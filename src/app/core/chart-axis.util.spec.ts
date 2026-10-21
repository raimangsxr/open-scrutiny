import { computeYAxisTicks, maxCharsPerBand } from './chart-axis.util';

describe('computeYAxisTicks', () => {
  it('shows every integer when vote counts are low', () => {
    expect(computeYAxisTicks(5)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('increases step as max votes grow to limit label count', () => {
    const ticks = computeYAxisTicks(90);
    expect(ticks[0]).toBe(0);
    expect(ticks.length).toBeLessThanOrEqual(12);
    expect(ticks[ticks.length - 1]).toBe(90);
    const step = ticks[1] - ticks[0];
    expect(step).toBeGreaterThan(1);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i] - ticks[i - 1]).toBe(step);
    }
  });
});

describe('maxCharsPerBand', () => {
  it('shrinks character limit when bands are narrow', () => {
    expect(maxCharsPerBand(210, 3)).toBe(10);
    expect(maxCharsPerBand(60, 3)).toBe(3);
  });
});
