import * as React from 'react';

/** The atlo "a" mark. Decorative — pair it with the "atlo" wordmark text for an accessible name. */
export const AtloLogo: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <img src="/atlo-mark.png" alt="" aria-hidden="true" className={`object-contain flex-shrink-0 ${className}`} />
);
