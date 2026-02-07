import React from 'react';
import clsx from 'clsx';
import IconButton from './IconButton';
import { X } from 'lucide-react';

interface ModalShellProps {
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  className?: string;
  bodyClassName?: string;
  overlayClassName?: string;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
};

const ModalShell: React.FC<ModalShellProps> = ({
  onClose,
  title,
  subtitle,
  header,
  footer,
  size = 'lg',
  closeOnBackdrop = true,
  className,
  bodyClassName,
  overlayClassName,
  children,
}) => {
  return (
    <div
      className={clsx('fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4', overlayClassName)}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={clsx(
          'relative w-full rounded-sm border border-[var(--color-sumo-line)] bg-[var(--color-sumo-cream)] shadow-2xl overflow-hidden',
          sizeClasses[size],
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {header ?? (
          (title || onClose) && (
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-sumo-line)] bg-white/80 px-6 py-4">
              <div>
                {title && <h2 className="text-2xl font-serif font-bold text-slate-900">{title}</h2>}
                {subtitle && <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>}
              </div>
              {onClose && (
                <IconButton variant="outline" size="sm" onClick={onClose} aria-label="Close">
                  <X className="h-4 w-4" />
                </IconButton>
              )}
            </div>
          )
        )}

        <div className={clsx('relative z-10 flex-1 overflow-y-auto', bodyClassName)}>{children}</div>

        {footer && <div className="border-t border-[var(--color-sumo-line)] bg-white/80 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export default ModalShell;
