import React from 'react';
import clsx from 'clsx';

interface ScreenShellProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  pattern?: 'washi' | 'yagasuri' | 'seigaiha' | 'none';
}

const widthClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
};

const patternClasses = {
  none: '',
  washi: 'bg-pattern-washi',
  yagasuri: 'bg-pattern-yagasuri',
  seigaiha: 'bg-pattern-seigaiha',
};

const ScreenShell: React.FC<ScreenShellProps> = ({
  maxWidth = 'lg',
  pattern = 'washi',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'min-h-screen w-full bg-[var(--color-sumo-cream)] text-[var(--color-sumo-ink)] relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
        patternClasses[pattern]
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#e9dfc9]/40 pointer-events-none" />
      <div className={clsx('relative z-10 mx-auto w-full px-4 py-10', widthClasses[maxWidth], className)}>
        {children}
      </div>
    </div>
  );
};

export default ScreenShell;
