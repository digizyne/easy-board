// Ephemeral positive reinforcement for completing cards.
// Philosophy: celebrate the *moment*, never keep score. No streaks, points, or
// leaderboards — those become the vanity metrics EASY argues against.
// canvas-confetti is imported lazily so it never touches the SSR bundle.

let confettiFn: ((opts: Record<string, unknown>) => void) | null = null

async function getConfetti() {
  if (!confettiFn) {
    const mod = await import('canvas-confetti')
    confettiFn = mod.default as unknown as (opts: Record<string, unknown>) => void
  }
  return confettiFn
}

const EMERALD = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#a7f3d0']

export function useCelebrate() {
  function reducedMotion() {
    return import.meta.client
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Small burst at a normalized (0–1) screen origin — one finished card.
  async function completionBurst(x: number, y: number) {
    if (!import.meta.client || reducedMotion()) return
    const confetti = await getConfetti()
    confetti({
      particleCount: 45,
      spread: 60,
      startVelocity: 32,
      gravity: 1.1,
      scalar: 0.8,
      ticks: 110,
      origin: { x, y },
      colors: EMERALD,
      disableForReducedMotion: true
    })
  }

  // Bigger, celebratory moment — the last Not-Done card is finished.
  async function allClearBurst() {
    if (!import.meta.client || reducedMotion()) return
    const confetti = await getConfetti()
    const base = { colors: EMERALD, disableForReducedMotion: true, ticks: 160, gravity: 1 }
    confetti({ ...base, particleCount: 120, spread: 100, startVelocity: 45, scalar: 1, origin: { x: 0.5, y: 0.35 } })
    confetti({ ...base, particleCount: 55, angle: 60, spread: 70, origin: { x: 0, y: 0.65 } })
    confetti({ ...base, particleCount: 55, angle: 120, spread: 70, origin: { x: 1, y: 0.65 } })
  }

  return { completionBurst, allClearBurst, reducedMotion }
}
