/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all touch-target cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 border-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none';

  const variants = {
    primary:
      'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs',
    secondary:
      'bg-muted hover:bg-muted/80 text-foreground border border-border shadow-xs',
    danger:
      'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs',
    ghost:
      'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
    outline:
      'bg-transparent border border-border hover:bg-muted text-foreground',
    gold:
      'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 gap-1.5 min-h-[38px]',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5 min-h-[48px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
