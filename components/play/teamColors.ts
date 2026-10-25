export const TEAM_COLORS = [
  "#FFC53D", // sun
  "#4DA8FF", // sky
  "#3DD9A5", // mint
  "#FF5A3C", // tomato
  "#B18CFF", // lilac
  "#FF8FB8", // pink
  "#FF9F45", // orange
  "#9BE15D", // lime
];

// Default category colours, in board order (repeats past five).
export const CATEGORY_COLORS = ["#FF5A3C", "#FFC53D", "#3DD9A5", "#4DA8FF", "#B18CFF"];

// Everything a category can be set to in the editor. All keep ink text readable.
export const CATEGORY_COLOR_OPTIONS = [...CATEGORY_COLORS, "#FF8FB8", "#FF9F45", "#9BE15D"];

export function categoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export function resolveCategoryColor(category: { color?: string }, index: number): string {
  return category.color ?? categoryColor(index);
}

export function nextTeamColor(usedColors: string[]): string {
  const unused = TEAM_COLORS.find((c) => !usedColors.includes(c));
  return unused ?? TEAM_COLORS[usedColors.length % TEAM_COLORS.length];
}
