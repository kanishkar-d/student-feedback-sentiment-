import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { AspectScore } from '../../types';

interface AspectRadarProps {
  data: AspectScore[];
}

export const AspectRadar: React.FC<AspectRadarProps> = ({ data }) => {
  const radarData = data.map(item => ({
    aspect: item.aspect_category,
    positive_percentage: item.pos_percentage,
    mentions: item.total_mentions
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
          <PolarAngleAxis dataKey="aspect" tick={{ fontSize: 10, fill: '#64748b' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
          <Radar
            name="Positive Satisfaction %"
            dataKey="positive_percentage"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
