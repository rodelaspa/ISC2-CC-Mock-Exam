/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-card text-card-foreground border border-border shadow-xs',
    elevated: 'bg-card text-card-foreground border border-border shadow-md',
    glass: 'bg-card/80 backdrop-blur-md border border-border/80 shadow-xs',
    subtle: 'bg-muted/40 border border-border text-foreground',
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-colors duration-150 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
