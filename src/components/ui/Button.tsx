import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'indigo' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  /** Text shown instead of children while isLoading */
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-md font-medium',
    md: 'px-3.5 py-2 text-sm gap-2 rounded-md font-medium',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-lg font-medium',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#121212] text-white hover:bg-[#262626] active:scale-[0.98] border border-transparent shadow-xs',
    secondary:
      'bg-[#f4f4f2] text-[#121212] hover:bg-[#ebeae7] active:scale-[0.98] border border-[#e4e3e0]',
    outline:
      'bg-white text-[#1f1e1d] hover:bg-[#f9f9f8] active:scale-[0.98] border border-[#e6e5e3] shadow-xs',
    ghost:
      'bg-transparent text-[#5a5957] hover:text-[#121212] hover:bg-[#f2f2ef] active:scale-[0.98]',
    indigo:
      'bg-[#4f46e5] text-white hover:bg-[#4338ca] active:scale-[0.98] border border-transparent shadow-xs',
    danger:
      'bg-[#ef4444] text-white hover:bg-[#dc2626] active:scale-[0.98] border border-transparent shadow-xs',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center cursor-pointer transition-all duration-150 ease-out select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
