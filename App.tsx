import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { COINS, SQL_SCHEMA } from './constants';
import { CryptoPrice, SimulationState, SimulationStatus } from './types';
import { fetchHistoricalData, processPriceTick } from './services/priceService';
import { Chart } from './components/Chart';
import { SimulationControls } from './components/SimulationControls';
import { ApiTools } from './components/ApiTools';
import { LayoutDashboard, Settings, Menu, X, Coins, AlertTriangle, Copy } from 'lucide-react';

const Dashboard = () => {
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [history, setHistory] = useState<CryptoPrice[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [dbError, setDbError] = useState<any>(null);

  // Simulation State
  const [simState, setSimState] = useState<SimulationState>({
    status: SimulationStatus.IDLE,
    startPrice: 0,
    targetPrice: 0,
    startTime: 0,
    duration: 0
  });

  // Load initial history
  useEffect(() => {
    const loadData = async () => {
        const { data, error } = await fetchHistoricalData(selectedCoin.symbol);
        
        if (error) {
            // Check for "Relation does not exist" error (PGRST205)
            if (error.code === 'PGRST205') {
                setDbError(error);
            }
        } else {
            setDbError(null);
            setHistory(data);
            if (data.length > 0) {
                setCurrentPrice(data[data.length - 1].price);
            }
        }
    };
    loadData();
    // Reset simulation on coin change
    setSimState({
        status: SimulationStatus.IDLE,
        startPrice: 0,
        targetPrice: 0,
        startTime: 0,
        duration: 0
    });
  }, [selectedCoin]);

  // Use refs to access latest state inside the interval without resetting it
  const stateRef = useRef({ currentPrice, simState, selectedCoin });
  useEffect(() => {
    stateRef.current = { currentPrice, simState, selectedCoin };
  }, [currentPrice, simState, selectedCoin]);

  // The "Background Process" - runs while component is mounted
  useEffect(() => {
    if (dbError) return; // Stop trying to fetch if DB is broken

    // We update local state every 2 seconds
    const intervalId = setInterval(async () => {
        const { currentPrice, simState, selectedCoin } = stateRef.current;
        
        const result = await processPriceTick(selectedCoin.symbol, currentPrice, simState);
        
        // Check for DB missing error during write
        if (result.error && result.error.code === 'PGRST205') {
            setDbError(result.error);
            return;
        }

        // Update Local State
        setCurrentPrice(result.nextPrice);
        setSimState(prev => ({ ...prev, status: result.nextStatus }));
        
        // Update Chart Data locally without refetching entire history
        const newPoint: CryptoPrice = {
            symbol: selectedCoin.symbol,
            price: result.nextPrice,
            timestamp: new Date().toISOString(),
            is_simulated: result.isSimulated
        };

        setHistory(prev => {
            const newHistory = [...prev, newPoint];
            return newHistory.slice(-200); // Keep last 200 points for performance
        });

    }, 2000); // 2 second tick

    return () => clearInterval(intervalId);
  }, [dbError]); 

  const handleStartSimulation = (target: number, duration: number) => {
    setSimState({
        status: SimulationStatus.ACTIVE,
        startPrice: currentPrice,
        targetPrice: target,
        startTime: Date.now(),
        duration: duration
    });
  };

  const handleStopSimulation = () => {
      setSimState(prev => ({ ...prev, status: SimulationStatus.RECOVERING }));
  };

  if (dbError?.code === 'PGRST205') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-200 p-4">
        <div className="max-w-2xl w-full bg-slate-800 rounded-xl border border-red-500/50 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 bg-red-500/10 flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-full text-red-400">
               <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Database Setup Required</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-slate-300">
              The table <code className="bg-slate-950 px-2 py-1 rounded text-cyan-400">crypto_prices</code> was not found in your Supabase project.
            </p>
            <div className="bg-slate-950 rounded-lg p-4 relative group">
               <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
                 {SQL_SCHEMA}
               </pre>
               <button 
                  onClick={() => navigator.clipboard.writeText(SQL_SCHEMA)}
                  className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                  title="Copy to Clipboard"
               >
                 <Copy size={16} />
               </button>
            </div>
            <p className="text-sm text-slate-500">
              Copy the SQL above and run it in the <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase SQL Editor</a> to initialize the database.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors mt-2"
            >
              I've run the SQL, Reload App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
                <Coins className="text-cyan-500" />
                CryptoSim
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                <X size={20} />
            </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Market Assets</div>
            <ul className="space-y-1">
                {COINS.map(coin => (
                    <li key={coin.symbol}>
                        <button
                            onClick={() => {
                                setSelectedCoin(coin);
                                setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center
                                ${selectedCoin.symbol === coin.symbol 
                                    ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/50' 
                                    : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                                }
                            `}
                        >
                            <span>{coin.name}</span>
                            <span className="text-xs opacity-60">{coin.symbol.replace('USDT', '')}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
                <Menu />
            </button>
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white hidden md:block">{selectedCoin.name} <span className="text-slate-500 text-sm font-normal">/ USDT</span></h2>
            </div>
            <div className="flex gap-4">
                 <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm font-medium">
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Dashboard</span>
                 </Link>
                 <Link to="/api-tools" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm font-medium">
                    <Settings size={18} />
                    <span className="hidden sm:inline">API & Widget</span>
                 </Link>
            </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Price Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-slate-400 text-sm font-medium mb-1">Current Price</div>
                    <div className="text-4xl font-bold text-white font-mono">
                        ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                    ${simState.status !== SimulationStatus.IDLE 
                        ? 'bg-purple-900/30 text-purple-400 border-purple-800' 
                        : 'bg-green-900/30 text-green-400 border-green-800'
                    }
                `}>
                    {simState.status !== SimulationStatus.IDLE ? 'Simulation Mode' : 'Live Binance Feed'}
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
                <Chart 
                    data={history} 
                    colors={{
                        lineColor: simState.status !== SimulationStatus.IDLE ? '#a855f7' : '#22c55e', // Purple if simulated
                        areaTopColor: simState.status !== SimulationStatus.IDLE ? 'rgba(168, 85, 247, 0.4)' : 'rgba(34, 197, 94, 0.4)',
                        areaBottomColor: simState.status !== SimulationStatus.IDLE ? 'rgba(168, 85, 247, 0.04)' : 'rgba(34, 197, 94, 0.04)',
                    }}
                />
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <SimulationControls 
                        currentPrice={currentPrice}
                        simulationState={simState}
                        onStart={handleStartSimulation}
                        onStop={handleStopSimulation}
                    />
                </div>
                <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="font-semibold text-slate-300 mb-4">Debug Log</h3>
                    <div className="font-mono text-xs text-slate-500 space-y-2">
                        <p>Timestamp: {new Date().toISOString()}</p>
                        <p>Source: {simState.status === SimulationStatus.IDLE ? 'Binance API v3' : 'Sim Engine (Brownian Motion)'}</p>
                        <p>DB Write: {dbError ? <span className="text-red-400">FAILED (Missing Table)</span> : "Syncing to 'crypto_prices'..."}</p>
                        <p>Next Tick: +2000ms</p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/api-tools" element={<ApiTools />} />
        {/* Widget Route - A simplified view for iframes */}
        <Route path="/widget" element={
             <div className="h-screen bg-slate-900">
                <Dashboard />
             </div>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;