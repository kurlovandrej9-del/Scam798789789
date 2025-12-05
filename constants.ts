import { Coin } from './types';

// NOTE: In a production environment, these should be environment variables.
// The user requested them to be exposed in the code for this specific task.
// We check if process is defined to avoid crashes in browser environments.
const env = typeof process !== 'undefined' ? process.env : {};

export const SUPABASE_URL = env.SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || 'your-anon-key-here';

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