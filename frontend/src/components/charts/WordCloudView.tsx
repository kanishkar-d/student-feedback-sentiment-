import React from 'react';
import { WordCloudItem } from '../../types';

interface WordCloudViewProps {
  items: WordCloudItem[];
}

export const WordCloudView: React.FC<WordCloudViewProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
        No frequent keywords detected yet.
      </div>
    );
  }

  const maxVal = Math.max(...items.map(i => i.value), 1);

  return (
    <div className="flex flex-wrap gap-2.5 items-center justify-center p-4 min-h-[16rem]">
      {items.map((item, idx) => {
        const relativeSize = Math.max(0.75, (item.value / maxVal) * 1.6);
        const fontRem = `${relativeSize.toFixed(2)}rem`;

        let colorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        if (item.sentiment === 'Positive') {
          colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        } else if (item.sentiment === 'Negative') {
          colorClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        }

        return (
          <span
            key={idx}
            style={{ fontSize: fontRem }}
            className={`px-3 py-1 rounded-full font-bold border shadow-xs transition-transform hover:scale-110 cursor-pointer ${colorClass}`}
            title={`${item.text}: ${item.value} mentions (${item.sentiment})`}
          >
            {item.text}
          </span>
        );
      })}
    </div>
  );
};
