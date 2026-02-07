import React from 'react';
import clsx from 'clsx';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {}

const Divider: React.FC<DividerProps> = ({ className, ...props }) => {
  return (
    <hr
      className={clsx('border-0 border-t border-[var(--color-sumo-line)]', className)}
      {...props}
    />
  );
};

export default Divider;
