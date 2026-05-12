import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** If provided, renders a Link to this path. Otherwise uses browser history (navigate(-1)). */
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = 'Back',
  className = '',
}) => {
  const navigate = useNavigate();
  const base =
    `inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-6 ${className}`;

  if (to) {
    return (
      <Link to={to} className={base}>
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    );
  }

  return (
    <button onClick={() => navigate(-1)} className={base}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
};
