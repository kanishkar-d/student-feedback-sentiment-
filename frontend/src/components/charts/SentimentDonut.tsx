import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SentimentDonutProps {
  positive: number;
  neutral: number;
  negative: number;
}

export const SentimentDonut: React.FC<SentimentDonutProps> = ({ positive, neutral, negative }) => {
  const data = [
    { name: 'Positive', value: positive, color: '#22c55e' },
    { name: 'Neutral', value: neutral, color: '#f59e0b' },
    { name: 'Negative', value: negative, color: '#ef4444' },
  ];

  const total = positive + neutral + negative;

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</p>
        <p className="text-[10px] uppercase font-bold text-slate-400">Total Feedbacks</p>
      </div>
    </div>
  );
};
