import React from 'react';
import { cn } from '@/lib/utils';

interface CalculatorButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'function';
  wide?: boolean;
  className?: string;
}

export function CalculatorButton({
  children,
  onClick,
  variant = 'number',
  wide = false,
  className,
}: CalculatorButtonProps) {
  const baseStyles = 'calc-btn rounded-full h-20 select-none';
  
  const variantStyles = {
    number: 'calc-btn-number',
    operator: 'calc-btn-operator',
    function: 'calc-btn-function',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        baseStyles,
        variantStyles[variant],
        wide ? 'col-span-2 w-full justify-start pl-8' : 'w-20',
        className
      )}
    >
      {children}
    </button>
  );
}
