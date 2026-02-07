import React from 'react';
import clsx from 'clsx';
import Illustration from './Illustration';
import { IllustrationKey } from '../../data/illustrations';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  illustrationKey?: IllustrationKey;
  align?: 'left' | 'center';
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  icon,
  actions,
  illustrationKey,
  align = 'left',
  className,
}) => {
  const isCenter = align === 'center';
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-sm border border-[var(--color-sumo-line)] bg-white shadow-[var(--shadow-sm)]',
        className
      )}
    >
      {illustrationKey && <Illustration illustrationKey={illustrationKey} className="absolute inset-0 opacity-80" />}
      <div className="relative z-10 flex flex-col gap-3 p-4 md:p-5">
        <div className={clsx('gap-4', isCenter ? 'flex flex-col items-center text-center' : 'flex items-start justify-between')}>
          <div className={clsx(isCenter ? 'flex flex-col items-center gap-3' : 'flex items-start gap-3')}>
            {icon && (
              <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[#b7282e] text-white shadow-sm">
                {icon}
              </div>
            )}
            <div>
              {eyebrow && (
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {eyebrow}
                </div>
              )}
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-tight">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className={clsx('flex items-center gap-2', isCenter && 'mt-3')}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
