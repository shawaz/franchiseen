"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import PortfolioChart from './PortfolioChart';

const PortfolioOverview = () => {
    const [timescale, setTimescale] = useState<'1D' | '1W' | '1M' | 'ALL'>('ALL');

    // Mock data for different timescales
    const chartData = {
        '1D': [42.1, 42.3, 42.2, 42.5, 42.4, 42.62],
        '1W': [38.5, 39.2, 41.0, 40.5, 42.1, 41.8, 42.62],
        '1M': [35.0, 36.5, 38.0, 37.2, 39.5, 41.0, 40.2, 42.62],
        'ALL': [30.0, 32.5, 31.0, 34.2, 33.5, 35.0, 34.8, 36.2, 35.5, 38.0, 37.5, 39.2, 38.8, 40.5, 41.2, 40.8, 42.62]
    };

    const totalPnL = 42.62;
    const isPositive = totalPnL >= 0;

    const timescales: ('1D' | '1W' | '1M' | 'ALL')[] = ['1D', '1W', '1M', 'ALL'];

    return (
        <Card className="bg-stone-900 border-stone-800 text-white p-6 overflow-hidden relative group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-gray-400 text-sm font-medium">Profit/Loss</span>
                    </div>
                    <div className="text-4xl font-bold tracking-tight mb-1">
                        ${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-gray-500 text-xs">All-Time</div>
                </div>

                <div className="flex bg-stone-800/50 rounded-lg p-1">
                    {timescales.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimescale(t)}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${timescale === t
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-stone-700/50'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 transition-opacity duration-300">
                <PortfolioChart
                    data={chartData[timescale]}
                    color="#6366f1"
                    height={140}
                />
            </div>

            {/* Subtle brand indicator */}
            <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
                <div className="w-4 h-4 rounded bg-indigo-500/50 rotate-45"></div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-200">FRANCHISEEN</span>
            </div>
        </Card>
    );
};

export default PortfolioOverview;
