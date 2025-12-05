import React, { useState } from 'react';
import { SimulationState, SimulationStatus } from '../types';
import { Play, Square, Activity } from 'lucide-react';

interface Props {
  currentPrice: number;
  simulationState: SimulationState;
  onStart: (target: number, duration: number) => void;
  onStop: () => void;
}

export const SimulationControls: React.FC<Props> = ({ 
  currentPrice, 
  simulationState, 
  onStart, 
  onStop 
}) => {
  const [target, setTarget] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');

  const handleStart = () => {
    if (!target || !duration) return;
    onStart(parseFloat(target), parseInt(duration));
  };

  const isRunning = simulationState.status !== SimulationStatus.IDLE;
  
  // Calculate percentage change for target
  const targetNum = parseFloat(target);
  const percentChange = targetNum && currentPrice 
    ? ((targetNum - currentPrice) / currentPrice) * 100 
    : 0;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex items-center gap-2 mb-4 text-cyan-400">
        <Activity size={20} />
        <h3 className="font-semibold text-lg">Simulation Matrix</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Target Price (USDT)</label>
          <div className="relative">
            <input
              type="number"
              disabled={isRunning}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none disabled:opacity-50"
              placeholder={currentPrice.toFixed(2)}
            />
            {target && (
              <span className={`absolute right-3 top-2 text-sm ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percentChange.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-1">Duration (Seconds)</label>
          <input
            type="number"
            disabled={isRunning}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none disabled:opacity-50"
          />
        </div>

        <div className="pt-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Play size={16} fill="currentColor" />
              Start Simulation
            </button>
          ) : (
            <button
              onClick={onStop}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Square size={16} fill="currentColor" />
              Stop / Reset
            </button>
          )}
        </div>

        {isRunning && (
          <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700/50 text-xs text-slate-400 animate-pulse">
            Status: <span className="text-cyan-400 font-bold">{simulationState.status}</span>
            <br/>
            Injecting volatility...
          </div>
        )}
      </div>
    </div>
  );
};