import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FacultyAnalytics } from '../../types';

interface FacultyBarProps {
  data: FacultyAnalytics[];
}

export const FacultyBar: React.FC<FacultyBarProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.faculty_name.replace('Dr. ', '').replace('Prof. ', ''),
    Positive: item.positive_count,
    Neutral: item.neutral_count,
    Negative: item.negative_count,
    Rating: item.avg_rating,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="top" height={36} formatter={(val) => <span className="text-xs font-semibold">{val}</span>} />
          <Bar dataKey="Positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Neutral" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
