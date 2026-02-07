import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'white' | 'paper';
  shadow?: 'none' | 'sm' | 'md';
}

const shadowClasses = {
  none: 'shadow-none',
  sm: 'shadow-[var(--shadow-sm)]',
  md: 'shadow-[var(--shadow-md)]',
};

const toneClasses = {
  white: 'bg-white',
  paper: 'bg-[var(--color-sumo-cream)]',
};

const Card: React.FC<CardProps> = ({
  tone = 'white',
  shadow = 'sm',
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-sm border border-[var(--color-sumo-line)]',
        toneClasses[tone],
        shadowClasses[shadow],
        className
      )}
      {...props}
    />
  );
};

export default Card;
