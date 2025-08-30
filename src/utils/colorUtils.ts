// Color utility functions for mapping cost data to colors

export const getColorForCost = (cost: number): string => {
  // Define cost ranges and corresponding colors
  const costRanges = [
    { max: 1.0, color: '#22c55e' }, // Green for very low cost
    { max: 2.0, color: '#84cc16' }, // Light green
    { max: 3.0, color: '#eab308' }, // Yellow
    { max: 4.0, color: '#f97316' }, // Orange
    { max: 5.0, color: '#ef4444' }, // Red
    { max: Infinity, color: '#991b1b' }, // Dark red for very high cost
  ];

  for (const range of costRanges) {
    if (cost <= range.max) {
      return range.color;
    }
  }

  return '#94a3b8'; // Default gray
};

export const getCostRangeLegend = () => {
  return [
    { range: '€0.0 - €1.0', color: '#22c55e', label: 'Very Low' },
    { range: '€1.0 - €2.0', color: '#84cc16', label: 'Low' },
    { range: '€2.0 - €3.0', color: '#eab308', label: 'Moderate' },
    { range: '€3.0 - €4.0', color: '#f97316', label: 'High' },
    { range: '€4.0 - €5.0', color: '#ef4444', label: 'Very High' },
    { range: '€5.0+', color: '#991b1b', label: 'Extreme' },
  ];
};

export const interpolateColor = (value: number, min: number, max: number): string => {
  // Normalize value between 0 and 1
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  // Define color stops (green to red)
  const colors = [
    { pos: 0, r: 34, g: 197, b: 94 },   // Green
    { pos: 0.25, r: 132, g: 204, b: 22 }, // Light green
    { pos: 0.5, r: 234, g: 179, b: 8 },   // Yellow
    { pos: 0.75, r: 249, g: 115, b: 22 }, // Orange
    { pos: 1, r: 239, g: 68, b: 68 },     // Red
  ];
  
  // Find the two colors to interpolate between
  let lowerColor = colors[0];
  let upperColor = colors[colors.length - 1];
  
  for (let i = 0; i < colors.length - 1; i++) {
    if (normalized >= colors[i].pos && normalized <= colors[i + 1].pos) {
      lowerColor = colors[i];
      upperColor = colors[i + 1];
      break;
    }
  }
  
  // Interpolate between the two colors
  const range = upperColor.pos - lowerColor.pos;
  const factor = range === 0 ? 0 : (normalized - lowerColor.pos) / range;
  
  const r = Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * factor);
  const g = Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * factor);
  const b = Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * factor);
  
  return `rgb(${r}, ${g}, ${b})`;
};