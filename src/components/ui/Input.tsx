import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  rightSlot?: React.ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  rightSlot,
  wrapperClassName,
  inputClassName,
  className,
  ...props
}) => {
  return (
    <div className={clsx('space-y-1.5', wrapperClassName, className)}>
      {label && (
        <label className="text-xs font-bold tracking-wider text-[#b7282e] font-serif">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={clsx(
            'w-full rounded-sm border border-slate-200 bg-white/80 px-4 py-3 text-slate-800 shadow-sm focus:border-[#b7282e] focus:outline-none focus:ring-2 focus:ring-[#b7282e]/20',
            inputClassName
          )}
          {...props}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {(hint || error) && (
        <p className={clsx('text-xs', error ? 'text-red-600' : 'text-slate-400')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
};

export default Input;
