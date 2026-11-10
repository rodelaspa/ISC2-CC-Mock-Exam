import React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  benchmarkPercent?: number; // e.g. 70
  showLabel?: boolean;
  color?: 'teal' | 'emerald' | 'amber' | 'rose' | 'cyan';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  benchmarkPercent = 70,
  showLabel = false,
  color = 'teal',
  height = 'md',
  className = '',
}) => {
  const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((current / total) * 100))) : 0;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const colors = {
    teal: 'bg-gradient-to-r from-teal-500 to-emerald-400',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div className={`space-y-1 w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{current}</strong> / {total}
          </span>
          <span className="font-mono font-bold text-foreground">{percent}%</span>
        </div>
      )}
      <div
        className={`relative w-full bg-muted rounded-full overflow-hidden border border-border/60 ${heights[height]}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[color]}`}
          style={{ width: `${percent}%` }}
        />
        {benchmarkPercent > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/80 shadow-sm z-10"
            style={{ left: `${benchmarkPercent}%` }}
            title={`${benchmarkPercent}%`}
          />
        )}
      </div>
    </div>
  );
};
