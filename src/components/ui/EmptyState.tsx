import React from 'react';
import clsx from 'clsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center text-center gap-2 py-12', className)}>
      {icon && <div className="text-slate-300">{icon}</div>}
      <h3 className="text-xl font-serif font-bold text-slate-400">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md">{description}</p>}
    </div>
  );
};

export default EmptyState;
