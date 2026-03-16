const AVATAR_COLORS = [
  '#003D79', // brand blue
  '#0F766E', // teal
  '#7C3AED', // purple
  '#B45309', // amber
  '#0369A1', // sky blue
  '#15803D', // green
  '#C2410C', // orange
  '#9D174D', // rose
  '#1D4ED8', // indigo
  '#6B21A8', // violet
];

/** Deterministically picks an avatar background color based on a user ID. */
export function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
