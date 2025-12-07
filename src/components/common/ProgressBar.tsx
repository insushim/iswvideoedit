'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'error';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      showValue = false,
      size = 'md',
      color = 'default',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const colorClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    return (
      <div className="w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-secondary',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full w-full flex-1 transition-all duration-300 ease-in-out',
              colorClasses[color]
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        {showValue && (
          <p className="mt-1 text-right text-sm text-muted-foreground">
            {value}%
          </p>
        )}
      </div>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

// Alias for backward compatibility
const ProgressBar = Progress;

export { Progress, ProgressBar };
