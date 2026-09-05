import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-[#e6e5e3] rounded-xl transition-all duration-200 ${
        interactive
          ? 'hover:border-[#d0cfcb] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
