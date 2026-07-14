/**
 * Fisher–Yates shuffle, then take up to `count` items.
 * If the list is shorter than `count`, returns a shallow copy of all items.
 */
export function pickRandomSample<T>(items: readonly T[], count: number): T[] {
  if (count <= 0 || items.length === 0) return []
  if (items.length <= count) return [...items]

  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = pool[i]!
    pool[i] = pool[j]!
    pool[j] = tmp
  }
  return pool.slice(0, count)
}
