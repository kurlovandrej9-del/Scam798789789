import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from 'lightweight-charts';
import { CryptoPrice } from '../types';

interface ChartProps {
  data: CryptoPrice[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export const Chart: React.FC<ChartProps> = ({ data, colors = {} }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const {
    backgroundColor = 'transparent',
    lineColor = '#22c55e', // green-500
    textColor = '#94a3b8', // slate-400
    areaTopColor = 'rgba(34, 197, 94, 0.56)',
    areaBottomColor = 'rgba(34, 197, 94, 0.04)',
  } = colors;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Dispose old chart if it exists (Strict Mode double-invoke protection)
    if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
    }

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth || 400 });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth || 400,
      height: 400,
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.4)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.4)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        mode: 1, // Magnet
      }
    });
    
    chartRef.current = chart;

    // Verify chart was created before adding series
    if (chart) {
        try {
            const newSeries = chart.addSeries(AreaSeries, {
              lineColor,
              topColor: areaTopColor,
              bottomColor: areaBottomColor,
            });
            seriesRef.current = newSeries;
        } catch (e) {
            console.error("Error creating chart series:", e);
        }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
      }
    };
  }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  // Update data when props change
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // Ensure data is sorted
      const sortedData = [...data].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const chartData = sortedData.map(d => ({
        time: (new Date(d.timestamp).getTime() / 1000) as any, // Library expects seconds
        value: d.price
      }));
      
      // Filter out duplicates based on time
      const uniqueData = chartData.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.time === item.time
        ))
      );

      seriesRef.current.setData(uniqueData);
      
      // We removed the automatic fitContent() here to allow users to zoom and scroll
      // without being reset every 2 seconds when new data arrives.
    }
  }, [data]);

  return (
    <div className="w-full h-[400px] relative" ref={chartContainerRef} />
  );
};