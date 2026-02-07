import React from 'react';
import clsx from 'clsx';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'red' | 'gold' | 'slate';
}

const toneClasses = {
  neutral: 'bg-white border-[var(--color-sumo-line)] text-slate-600',
  red: 'bg-red-50 border-red-200 text-[#b7282e]',
  gold: 'bg-amber-50 border-amber-200 text-amber-900',
  slate: 'bg-slate-100 border-slate-200 text-slate-600',
};

const Tag: React.FC<TagProps> = ({ tone = 'neutral', className, ...props }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
};

export default Tag;
