import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingBarProps {
  progress?: number;
  className?: string;
  showPercentage?: boolean;
}

export function LoadingBar({ 
  progress = 0, 
  className,
  showPercentage = true 
}: LoadingBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Chargement</span>
        {showPercentage && (
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}