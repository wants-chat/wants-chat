import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import type { DailyTrend } from '../../../types/health/sleep';

interface SleepQualityChartProps {
  data: DailyTrend[];
  isLoading?: boolean;
}

export const SleepQualityChart: React.FC<SleepQualityChartProps> = ({
  data,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
    durationHours: item.duration / 60,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sleep Quality Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-white/40">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sleep Quality Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-white/40">
            No sleep data yet. Start logging your sleep to see trends!
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const qualityScore = payload.find((p: any) => p.dataKey === 'qualityScore');
      const duration = payload.find((p: any) => p.dataKey === 'durationHours');

      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {qualityScore && (
            <p className="text-sm text-purple-400">
              Quality: <span className="font-semibold">{Math.round(qualityScore.value)}</span>
            </p>
          )}
          {duration && (
            <p className="text-sm text-teal-400">
              Duration: <span className="font-semibold">{formatDuration(duration.value * 60)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Sleep Quality Trends</span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
              <span className="text-white/60">Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
              <span className="text-white/60">Duration</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="dateLabel"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis
                yAxisId="quality"
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis
                yAxisId="duration"
                orientation="right"
                domain={[0, 12]}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="quality"
                type="monotone"
                dataKey="qualityScore"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#qualityGradient)"
              />
              <Area
                yAxisId="duration"
                type="monotone"
                dataKey="durationHours"
                stroke="#14b8a6"
                strokeWidth={2}
                fill="url(#durationGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepQualityChart;
