/**
 * Generates the next price step using a simplified Brownian Motion with Drift.
 * 
 * @param currentPrice - P(t)
 * @param targetPrice - P(target)
 * @param timeLeft - Time remaining in seconds
 * @param volatility - Randomness factor (standard deviation approximation)
 * @returns The next price P(t+1)
 */
export const calculateNextSimulatedPrice = (
  currentPrice: number,
  targetPrice: number,
  timeLeft: number,
  volatility: number = 0.02
): number => {
  if (timeLeft <= 0) return targetPrice;

  // 1. Calculate the required drift to hit the target
  // We want to close the gap over the remaining time.
  // gap = target - current
  // drift per second = gap / timeLeft
  const gap = targetPrice - currentPrice;
  const drift = gap / timeLeft;

  // 2. Add "Jerky" movement (White Noise)
  // Box-Muller transform for normal distribution
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  const normalRandom = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  
  // Scale volatility based on price magnitude
  const noise = currentPrice * (volatility / 10) * normalRandom;

  // 3. Combine
  // We add a bit of noise but ensure the drift dominates as time gets shorter
  const nextPrice = currentPrice + drift + noise;

  return Math.max(0.000001, nextPrice); // Ensure price never goes negative or zero
};

/**
 * Calculates a recovery step to move back to the "Real" market price naturally.
 */
export const calculateRecoveryPrice = (
  currentSimPrice: number,
  realMarketPrice: number
): number => {
  const gap = realMarketPrice - currentSimPrice;
  // Recover 10% of the gap per tick plus some noise for realism
  const recoveryStep = gap * 0.1;
  
  const noise = (Math.random() - 0.5) * (realMarketPrice * 0.001); // Tiny noise
  
  return currentSimPrice + recoveryStep + noise;
};