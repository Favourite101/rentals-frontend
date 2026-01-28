import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader size="lg" />
    </div>
  );
};

export const FullPageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};
