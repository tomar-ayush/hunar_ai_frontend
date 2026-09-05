import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dotColor?: string }> = {
    default: {
      container: 'bg-[#18181b] text-white border-transparent',
      dotColor: 'bg-white',
    },
    neutral: {
      container: 'bg-[#f4f4f2] text-[#484744] border-[#e6e5e3]',
      dotColor: 'bg-[#8c8b88]',
    },
    success: {
      container: 'bg-[#edf7ee] text-[#1b6b27] border-[#d4ebd6]',
      dotColor: 'bg-[#1b6b27]',
    },
    warning: {
      container: 'bg-[#fef7ec] text-[#975a16] border-[#fde4c0]',
      dotColor: 'bg-[#d97706]',
    },
    danger: {
      container: 'bg-[#fdf2f2] text-[#9b1c1c] border-[#f8b4b4]',
      dotColor: 'bg-[#dc2626]',
    },
    info: {
      container: 'bg-[#edf4fe] text-[#1a56db] border-[#d3e3fd]',
      dotColor: 'bg-[#2563eb]',
    },
    purple: {
      container: 'bg-[#f5f3ff] text-[#6366f1] border-[#e0e7ff]',
      dotColor: 'bg-[#6366f1]',
    },
    outline: {
      container: 'bg-transparent text-[#5a5957] border-[#e6e5e3]',
      dotColor: 'bg-[#8c8b88]',
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight border transition-colors ${current.container} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dotColor}`} />
      )}
      {children}
    </span>
  );
};
