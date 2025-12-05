import React from 'react';
import { Code, Copy, Terminal } from 'lucide-react';
import { SUPABASE_URL } from '../constants';

export const ApiTools: React.FC = () => {
  const widgetCode = `<iframe 
  src="${window.location.origin}/#/widget?symbol=BTCUSDT" 
  width="100%" 
  height="500" 
  frameborder="0"
></iframe>`;

  const curlCommand = `curl '${SUPABASE_URL}/rest/v1/crypto_prices?select=*&symbol=eq.BTCUSDT&order=timestamp.desc&limit=1' \\
  -H "apikey: YOUR_PUBLIC_KEY" \\
  -H "Authorization: Bearer YOUR_PUBLIC_KEY"`;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Developer Tools</h1>
      <p className="text-slate-400 mb-8">Integrate our simulation engine into your own platforms.</p>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Widget Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white text-xl font-semibold">
            <Code className="text-blue-500" />
            <h2>Embed Widget</h2>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-4">
              Use this iframe to embed the live chart (including simulations) on your website. 
              Change the <code>symbol</code> query parameter to target different assets.
            </p>
            <div className="bg-slate-950 p-4 rounded-lg relative group">
              <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap break-all">
                {widgetCode}
              </pre>
              <button 
                onClick={() => navigator.clipboard.writeText(widgetCode)}
                className="absolute top-2 right-2 p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                title="Copy Code"
              >
                <Copy size={14} />
              </button>
            </div>
            
            <div className="mt-6">
                <h3 className="text-white text-sm font-medium mb-2">Preview</h3>
                <div className="border border-slate-600 rounded overflow-hidden h-48 bg-slate-900 flex items-center justify-center">
                    <span className="text-slate-500 text-sm">Widget Preview Area</span>
                </div>
            </div>
          </div>
        </div>

        {/* API Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white text-xl font-semibold">
            <Terminal className="text-green-500" />
            <h2>Direct API Access</h2>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-4">
              Query the database directly using Supabase REST API.
            </p>
            
            <div className="space-y-4">
                <div>
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Endpoint</span>
                    <div className="mt-1 bg-slate-950 p-3 rounded font-mono text-sm text-green-300">
                        GET {SUPABASE_URL}/rest/v1/crypto_prices
                    </div>
                </div>

                <div>
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Example Request</span>
                    <div className="mt-1 bg-slate-950 p-3 rounded font-mono text-xs text-green-300 overflow-x-auto">
                        {curlCommand}
                    </div>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};