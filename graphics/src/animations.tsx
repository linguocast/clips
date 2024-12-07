export const popAnimation = (start: number, currentTime: number, maxScale: number, duration: number): number => {
  if (currentTime < start) return 1
  return animate(maxScale, 1, start, currentTime, duration)
}

export const animate = (
  initialValue: number,
  finalValue: number,
  startTime: number,
  currentTime: number,
  duration: number,
  easeFn: (v: number) => number = (v) => v
) => {
  if (currentTime < startTime) return initialValue
  if (currentTime >= startTime + duration) return finalValue

  const interpolationAmount = finalValue - initialValue

  const passedRate = (currentTime - startTime) / duration
  return initialValue + interpolationAmount * easeFn(passedRate)
}

