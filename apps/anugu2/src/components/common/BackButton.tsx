import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = 'Back',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/portal/dashboard');
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm group
        bg-white dark:bg-[#171A3B] 
        text-slate-700 dark:text-slate-200 
        hover:text-[#6338F5] dark:hover:text-white 
        border border-slate-200 dark:border-indigo-500/25 
        hover:border-[#6338F5] dark:hover:border-indigo-500/60 
        hover:bg-slate-50 dark:hover:bg-[#1f234d] 
        ${className}`}
      title="Navigate back"
      aria-label="Back button"
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-[#6338F5]" />
      <span>{label}</span>
    </button>
  );
};
