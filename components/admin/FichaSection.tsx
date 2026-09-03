'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FichaSectionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: string;
}

export function FichaSection({
  title,
  icon,
  defaultOpen = true,
  children,
  badge
}: FichaSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="ficha-section">
      <div 
        className={`ficha-section-header ${isOpen ? 'open' : ''}`}
        onClick={toggleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
      >
        <div className="ficha-section-title-wrap">
          {icon && <span className="ficha-section-icon">{icon}</span>}
          <span className="ficha-section-title">{title}</span>
          {badge && <span className="titular-badge">{badge}</span>}
        </div>
        <ChevronDown size={16} className="ficha-chevron" />
      </div>
      
      {isOpen && (
        <div className="ficha-section-body">
          {children}
        </div>
      )}
    </div>
  );
}
