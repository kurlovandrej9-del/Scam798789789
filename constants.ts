import { Coin } from './types';

// Helper to access environment variables safely in Vite/Browser
const getEnv = (key: string, defaultValue: string): string => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // Fallback for Node-like environments if necessary
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return defaultValue;
};

// Default values moved from lib/supabase.ts to here for centralization
const DEFAULT_SUPABASE_URL = 'https://rbycgxevlfjpmuqfoucf.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieWNneGV2bGZqcG11cWZvdWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTYwODYsImV4cCI6MjA4MDQ3MjA4Nn0.pJzi9hMpZGED_PJ0zI4YB8g_MRFX0-Ig5eyBl60_4PQ';

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', DEFAULT_SUPABASE_URL);
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_KEY);

export const COINS: Coin[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'BNBUSDT', name: 'Binance Coin' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'XRPUSDT', name: 'Ripple' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'DOTUSDT', name: 'Polkadot' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' },
  { symbol: 'LINKUSDT', name: 'Chainlink' },
  { symbol: 'MATICUSDT', name: 'Polygon' },
  { symbol: 'LTCUSDT', name: 'Litecoin' },
  { symbol: 'UNIUSDT', name: 'Uniswap' },
  { symbol: 'ATOMUSDT', name: 'Cosmos' },
  { symbol: 'ETCUSDT', name: 'Ethereum Classic' },
  { symbol: 'XLMUSDT', name: 'Stellar' },
  { symbol: 'FILUSDT', name: 'Filecoin' },
  { symbol: 'NEARUSDT', name: 'Near Protocol' },
  { symbol: 'VETUSDT', name: 'VeChain' },
  { symbol: 'ALGOUSDT', name: 'Algorand' },
  { symbol: 'APEUSDT', name: 'ApeCoin' },
  { symbol: 'ICPUSDT', name: 'Internet Computer' },
  { symbol: 'MANAUSDT', name: 'Decentraland' },
  { symbol: 'SANDUSDT', name: 'The Sandbox' },
  { symbol: 'AXSUSDT', name: 'Axie Infinity' },
  { symbol: 'THETAUSDT', name: 'Theta Network' },
  { symbol: 'AAVEUSDT', name: 'Aave' },
  { symbol: 'EOSUSDT', name: 'EOS' },
  { symbol: 'XTZUSDT', name: 'Tezos' },
  { symbol: 'KCSUSDT', name: 'KuCoin Token' },
  { symbol: 'MKRUSDT', name: 'Maker' },
  { symbol: 'GALAUSDT', name: 'Gala' },
  { symbol: 'RUNEUSDT', name: 'THORChain' },
  { symbol: 'GRTUSDT', name: 'The Graph' },
  { symbol: 'FTMUSDT', name: 'Fantom' },
  { symbol: 'SNXUSDT', name: 'Synthetix' },
  { symbol: 'CHZUSDT', name: 'Chiliz' },
  { symbol: 'ENJUSDT', name: 'Enjin Coin' },
  { symbol: 'LRCUSDT', name: 'Loopring' },
  { symbol: 'BATUSDT', name: 'Basic Attention Token' }
];

export const SQL_SCHEMA = `
-- Run this in your Supabase SQL Editor
create table crypto_prices (
  id uuid default uuid_generate_v4() primary key,
  symbol text not null,
  price float not null,
  timestamp timestamptz not null default now(),
  is_simulated boolean default false
);

-- Index for faster querying by symbol and time
create index idx_crypto_prices_symbol_timestamp on crypto_prices(symbol, timestamp desc);

-- Realtime needs to be enabled for this table in Supabase Dashboard
`;