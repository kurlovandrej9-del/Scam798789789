export interface CryptoPrice {
  id?: string;
  symbol: string;
  price: number;
  timestamp: string; // ISO string
  is_simulated: boolean;
}

export interface Coin {
  symbol: string;
  name: string;
}

export enum SimulationStatus {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  RECOVERING = 'RECOVERING'
}

export interface SimulationState {
  status: SimulationStatus;
  startPrice: number;
  targetPrice: number;
  startTime: number;
  duration: number; // in seconds
  recoveryStartTime?: number;
}

// Supabase Database Row Type
export interface PriceRow {
  id: string;
  symbol: string;
  price: number;
  timestamp: string;
  is_simulated: boolean;
}