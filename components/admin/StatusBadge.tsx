'use client';

import React from 'react';

export interface StatusBadgeProps {
  estado: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ estado, size = 'md' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'size-sm' : 'size-md';
  
  let modifierClass = '';
  let label = estado;

  switch (estado) {
    case 'carga':
      modifierClass = 'status-badge--carga';
      label = 'En carga';
      break;
    case 'en_revision':
      modifierClass = 'status-badge--en_revision';
      label = 'En revisión';
      break;
    case 'confirmada':
      modifierClass = 'status-badge--confirmada';
      label = 'Confirmada';
      break;
    case 'eliminada':
      modifierClass = 'status-badge--eliminada';
      label = 'Eliminada';
      break;
    default:
      modifierClass = '';
      label = estado;
  }

  return (
    <span className={`status-badge ${modifierClass} ${sizeClass}`}>
      {label}
    </span>
  );
}
