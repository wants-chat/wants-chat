import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: { date: string; value: number }[];
}

const Sparkline: React.FC<SparklineProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;