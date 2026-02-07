import React from 'react';
import clsx from 'clsx';

interface AppShellProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const AppShell: React.FC<AppShellProps> = ({ header, children, footer, className }) => {
  return (
    <div className={clsx('h-[100svh] w-screen bg-[var(--color-sumo-cream)] text-slate-800 font-sans flex flex-col overflow-hidden', className)}>
      {header}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
      {footer}
    </div>
  );
};

export default AppShell;
