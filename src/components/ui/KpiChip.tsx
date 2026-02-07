import React from 'react';
import clsx from 'clsx';

interface KpiChipProps {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'gold';
  className?: string;
}

const KpiChip: React.FC<KpiChipProps> = ({ label, value, tone = 'default', className }) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono',
        tone === 'gold'
          ? 'border-amber-300 bg-amber-50 text-amber-900'
          : 'border-[var(--color-sumo-line)] bg-white text-slate-600',
        className
      )}
    >
      <span className="text-[10px] uppercase tracking-widest text-slate-400">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
};

export default KpiChip;
