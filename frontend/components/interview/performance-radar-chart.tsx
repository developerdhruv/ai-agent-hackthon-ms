'use client';

import { useTheme } from 'next-themes';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface MetricsProps {
  clarity: number;
  confidence: number;
  relevance: number;
  completeness: number;
  technicalAccuracy?: number;
}

export function PerformanceRadarChart({ metrics }: { metrics: MetricsProps }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Transform the metrics into the format needed for the radar chart
  const transformedData = Object.entries(metrics)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({
      subject: formatMetricName(key),
      A: value,
      fullMark: 100,
    }));
  
  function formatMetricName(metric: string) {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          outerRadius={90}
          width={500}
          height={300}
          data={transformedData}
        >
          <PolarGrid stroke={isDark ? '#333' : '#e5e5e5'} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: isDark ? '#ccc' : '#333', fontSize: 10 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: isDark ? '#ccc' : '#333', fontSize: 10 }}
          />
          <Radar
            name="Performance"
            dataKey="A"
            stroke="hsl(var(--chart-1))"
            fill="hsl(var(--chart-1))"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? 'hsl(var(--background))' : 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
            }}
            formatter={(value: number) => [`${value}/100`, 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}