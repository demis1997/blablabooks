const INTRO_KEY = "bbb_intro_seen";

function canUseSessionStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__bbb_ss_test__";
    window.sessionStorage.setItem(testKey, "1");
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** Returns false on the server; client checks sessionStorage. */
export function hasSeenIntro(): boolean {
  if (!canUseSessionStorage()) return false;
  return window.sessionStorage.getItem(INTRO_KEY) === "1";
}

export function markIntroSeen(): void {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(INTRO_KEY, "1");
}
