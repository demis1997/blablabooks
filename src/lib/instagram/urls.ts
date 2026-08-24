export function isInstagramMediaUrl(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    return (
      host.includes("cdninstagram.com") ||
      host.includes("fbcdn.net") ||
      host.includes("instagram.com")
    );
  } catch {
    return false;
  }
}
