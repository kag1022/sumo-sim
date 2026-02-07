import React from 'react';
import clsx from 'clsx';

type SurfaceTone = 'paper' | 'panel' | 'white';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
}

const toneClasses: Record<SurfaceTone, string> = {
  paper: 'bg-[var(--color-sumo-cream)]',
  panel: 'bg-[var(--color-sumo-paper)]',
  white: 'bg-white',
};

const Surface: React.FC<SurfaceProps> = ({ tone = 'paper', className, ...props }) => {
  return <div className={clsx(toneClasses[tone], className)} {...props} />;
};

export default Surface;
