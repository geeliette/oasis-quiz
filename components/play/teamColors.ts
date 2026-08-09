export const TEAM_COLORS = [
  "#F5A524", // amber
  "#3B82F6", // blue
  "#22C55E", // green
  "#FB7185", // coral
  "#A855F7", // purple
  "#2DD4BF", // teal
  "#F43F5E", // rose
  "#84CC16", // lime
];

export function nextTeamColor(usedColors: string[]): string {
  const unused = TEAM_COLORS.find((c) => !usedColors.includes(c));
  return unused ?? TEAM_COLORS[usedColors.length % TEAM_COLORS.length];
}
