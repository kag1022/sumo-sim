
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'action' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    children,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 whitespace-nowrap";

    const variants = {
        primary: "bg-[#b7282e] hover:bg-[#a02027] text-white border border-[#b7282e] focus:ring-[#b7282e]",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 focus:ring-slate-400",
        action: "bg-amber-400 text-amber-950 hover:bg-amber-300 border border-amber-500 focus:ring-amber-500",
        outline: "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none focus:ring-slate-400"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
