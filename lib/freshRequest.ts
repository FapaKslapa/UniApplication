let fresh = false;

export const FRESH_HEADER = "x-fresh-data";

export function isFreshRequest(): boolean {
  return fresh;
}

export async function withFreshData<T>(run: () => Promise<T>): Promise<T> {
  fresh = true;
  try {
    return await run();
  } finally {
    fresh = false;
  }
}
