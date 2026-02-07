import React from 'react';
import clsx from 'clsx';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'paper' | 'white';
}

const Panel: React.FC<PanelProps> = ({ tone = 'paper', className, ...props }) => {
  return (
    <div
      className={clsx(
        'border border-[var(--color-sumo-line)] rounded-sm shadow-[var(--shadow-sm)]',
        tone === 'paper' ? 'bg-[var(--color-sumo-cream)]' : 'bg-white',
        className
      )}
      {...props}
    />
  );
};

export default Panel;
