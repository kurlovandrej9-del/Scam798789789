import { supabase } from '../lib/supabase';
import { CryptoPrice, SimulationState, SimulationStatus } from '../types';
import { calculateNextSimulatedPrice, calculateRecoveryPrice } from '../lib/math';

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/price';

// Fetch real price from Binance
export const fetchRealPrice = async (symbol: string): Promise<number | null> => {
  try {
    const res = await fetch(`${BINANCE_API}?symbol=${symbol}`);
    if (!res.ok) throw new Error('Binance API Error: ' + res.statusText);
    const data = await res.json();
    return parseFloat(data.price);
  } catch (error) {
    // Silent fail for CORS/Network issues, return null to skip update or use last known
    console.warn('Failed to fetch real price (check CORS or API status):', error);
    return null;
  }
};

// Main Loop Function
export const processPriceTick = async (
  symbol: string,
  currentPrice: number,
  simulationState: SimulationState
): Promise<{ nextPrice: number; isSimulated: boolean; nextStatus: SimulationStatus; error?: any }> => {
  
  const now = Date.now();
  let nextPrice = currentPrice;
  let isSimulated = false;
  let nextStatus = simulationState.status;

  // 1. Check if Simulation is Active
  if (simulationState.status === SimulationStatus.ACTIVE) {
    const elapsedSeconds = (now - simulationState.startTime) / 1000;
    const timeLeft = simulationState.duration - elapsedSeconds;

    if (timeLeft <= 0) {
      // Time is up, switch to recovering
      nextStatus = SimulationStatus.RECOVERING;
      isSimulated = true;
      // We are at target roughly
      nextPrice = simulationState.targetPrice;
    } else {
      // Calculate next jerky step
      nextPrice = calculateNextSimulatedPrice(
        currentPrice,
        simulationState.targetPrice,
        timeLeft
      );
      isSimulated = true;
    }
  } 
  
  // 2. Check if Recovering (Blending back to real)
  else if (simulationState.status === SimulationStatus.RECOVERING) {
    const realPrice = await fetchRealPrice(symbol);
    if (realPrice) {
      // Calculate step towards real price
      nextPrice = calculateRecoveryPrice(currentPrice, realPrice);
      isSimulated = true;

      // Check if we are "close enough" to stop simulating
      const percentDiff = Math.abs((nextPrice - realPrice) / realPrice);
      if (percentDiff < 0.001) { // 0.1% difference
        nextStatus = SimulationStatus.IDLE;
        nextPrice = realPrice; // Snap to real
      }
    }
  } 
  
  // 3. Idle (Real Data)
  else {
    const realPrice = await fetchRealPrice(symbol);
    if (realPrice) {
      nextPrice = realPrice;
      isSimulated = false;
    } else if (currentPrice === 0) {
        // Fallback for initial load if Binance fails
        nextPrice = 1000; // Dummy fallback to prevent 0
    }
  }

  // 4. Persist to DB
  const { error } = await supabase.from('crypto_prices').insert({
    symbol,
    price: nextPrice,
    timestamp: new Date().toISOString(),
    is_simulated: isSimulated
  });

  if (error) {
    // Suppress logging for "Table not found" as the UI handles this
    if (error.code !== 'PGRST205') {
        console.error('Supabase write error:', JSON.stringify(error, null, 2));
    }
    return { nextPrice, isSimulated, nextStatus, error };
  }

  return { nextPrice, isSimulated, nextStatus };
};

export const fetchHistoricalData = async (symbol: string, limit = 100): Promise<{ data: CryptoPrice[], error: any }> => {
  const { data, error } = await supabase
    .from('crypto_prices')
    .select('*')
    .eq('symbol', symbol)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    // Suppress logging for "Table not found" as the UI handles this
    if (error.code !== 'PGRST205') {
        console.error('Error fetching history:', JSON.stringify(error, null, 2));
    }
    return { data: [], error };
  }

  // Return reversed (chronological order for charts)
  return { data: (data as CryptoPrice[]).reverse(), error: null };
};