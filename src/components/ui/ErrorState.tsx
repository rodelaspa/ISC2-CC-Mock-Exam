/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button } from './Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive flex flex-col items-center text-center my-4"
    >
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
        <AlertTriangle className="w-5 h-5 text-destructive" />
      </div>
      <h4 className="text-sm font-semibold mb-1 text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
};
