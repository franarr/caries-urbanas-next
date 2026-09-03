'use client';

import React from 'react';
import { DenunciaInbox } from '@/components/admin/DenunciaInbox';

export default function AdminDenunciasPage() {
  return (
    <div style={{ flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      <DenunciaInbox />
    </div>
  );
}
