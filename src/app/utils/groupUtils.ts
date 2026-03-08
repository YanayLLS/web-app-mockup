// Utility functions for group color management

const GROUP_COLORS = [
  '#2f80ed', // Blue
  '#11e874', // Green
  '#f2994a', // Orange
  '#9b51e0', // Purple
  '#eb5757', // Red
  '#56ccf2', // Cyan
  '#f2c94c', // Yellow
  '#219653', // Dark Green
  '#bb6bd9', // Light Purple
];

/**
 * Generates a random color from the predefined color palette
 */
export function getRandomGroupColor(): string {
  return GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
}

/**
 * Gets all available group colors
 */
export function getGroupColors(): string[] {
  return [...GROUP_COLORS];
}
