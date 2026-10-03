const chartVar = (n: number) => `var(--chart-${(n % 5) + 1})`;

export const DEVICE_COLORS = [0, 1, 2, 3].map(chartVar);

export const BROWSER_COLORS = [0, 1, 2, 3, 4, 5, 6, 7].map(chartVar);

export const OS_COLORS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(chartVar);

export const DATE_PRESETS = [
  { label: "7g", days: 7 },
  { label: "14g", days: 14 },
  { label: "30g", days: 30 },
  { label: "90g", days: 90 },
];
