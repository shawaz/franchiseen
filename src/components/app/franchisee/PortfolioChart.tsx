"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PortfolioChartProps {
    data: number[];
    color?: string;
    height?: number;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({
    data,
    color = "#6366f1", // Indigo
    height = 120
}) => {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 10;
    const chartHeight = height - padding * 2;

    // Points calculation
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = padding + (chartHeight - ((val - min) / range) * chartHeight);
        return { x, y };
    });

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    // Fill path (closing the shape for gradient)
    const fillPathData = `${pathData} L 100,${height} L 0,${height} Z`;

    return (
        <div className="relative w-full overflow-hidden" style={{ height }}>
            <svg
                viewBox={`0 0 100 ${height}`}
                className="w-full h-full"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Area Gradient */}
                <motion.path
                    initial={{ opacity: 0, d: `M 0,${height} L 0,${height} L 100,${height} Z` }}
                    animate={{ opacity: 1, d: fillPathData }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    fill="url(#chartGradient)"
                />

                {/* Main Line */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                />
            </svg>
        </div>
    );
};

export default PortfolioChart;
