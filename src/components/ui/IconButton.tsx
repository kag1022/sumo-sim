import React from 'react';
import clsx from 'clsx';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md';
}

const variantClasses = {
  ghost: 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100',
  outline:
    'bg-white border border-[var(--color-sumo-line)] text-slate-600 hover:border-slate-300 hover:text-slate-900',
  solid: 'bg-[var(--color-sumo-red)] text-white hover:bg-[#a01e23]',
};

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
};

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-sumo-red)] focus:ring-offset-1',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

export default IconButton;
