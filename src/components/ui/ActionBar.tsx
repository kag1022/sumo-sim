import React from 'react';
import clsx from 'clsx';

interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const ActionBar: React.FC<ActionBarProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        'sticky bottom-0 z-10 border-t border-[var(--color-sumo-line)] bg-[var(--color-sumo-cream)]/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]',
        className
      )}
      {...props}
    />
  );
};

export default ActionBar;
