export function sanitizeBadge(badge: string): string {
  return badge.toLowerCase().replace(/\+/g, '-plus');
}
