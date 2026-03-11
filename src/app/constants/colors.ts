/** Shared color palette for group assignments */
export const GROUP_COLORS = [
  '#2F80ED', // Blue
  '#8404B3', // Purple
  '#11E874', // Green
  '#FF6B35', // Orange
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#FF9800', // Amber
  '#9C27B0', // Deep Purple
  '#56CCF2', // Light Blue
  '#F2C94C', // Yellow
  '#219653', // Dark Green
  '#BB6BD9', // Light Purple
] as const;

export function getRandomGroupColor(): string {
  return GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
}

export function getGroupColors(): string[] {
  return [...GROUP_COLORS];
}
