'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartWrapperProps {
  options: any;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
}

export const EChartWrapper: React.FC<EChartWrapperProps> = ({
  options,
  style = { width: '100%', height: '360px' },
  className = '',
  loading = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        renderer: 'canvas',
      });
    }

    const chart = chartInstance.current;

    if (loading) {
      chart.showLoading('default', {
        text: 'Memuat data...',
        color: '#1a5287',
        textColor: '#64748b',
        maskColor: 'rgba(255, 255, 255, 0.6)',
      });
    } else {
      chart.hideLoading();
      chart.setOption(options, true);
    }

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [options, loading]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return <div ref={chartRef} style={style} className={className} />;
};
