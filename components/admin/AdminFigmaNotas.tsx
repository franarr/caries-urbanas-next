'use client';

import React, { useState } from 'react';
import { RelevamientoResumen } from '@/lib/api-admin';

export interface NotaInterna {
  id: string;
  autor: string;
  cargo: string;
  fecha: string;
  texto: string;
}

interface AdminFigmaNotasProps {
  caseData: RelevamientoResumen | undefined;
  notes: NotaInterna[];
  onAddNote: (texto: string) => void;
  onBackToCase: () => void;
}

export function AdminFigmaNotas({
  caseData,
  notes,
  onAddNote,
  onBackToCase,
}: AdminFigmaNotasProps) {
  const [newText, setNewText] = useState('');

  const formattedId = caseData
    ? `#${String(caseData.nro_relevamiento || caseData.id).padStart(4, '0')}`
    : '#0000';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddNote(newText.trim());
    setNewText('');
  };

  return (
    <div className="notes-view">
      {/* Retorno a la ficha del caso */}
      <div>
        <button type="button" onClick={onBackToCase} className="back-link">
          ← Volver al caso {formattedId}
        </button>
      </div>

      {/* Encabezado */}
      <div className="notes-header">
        <h1 className="notes-title">Notas Internas — Caso {formattedId}</h1>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
          Bitácora administrativa y seguimiento técnico de actuaciones municipales
        </p>
      </div>

      {/* Distribución en 2 columnas */}
      <div className="notes-grid">
        {/* Columna Izquierda: Listado cronológico de notas */}
        <div className="notes-stream">
          {notes.length === 0 ? (
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '36px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              No se han registrado notas internas para este expediente todavía.
            </div>
          ) : (
            notes.map((n) => (
              <article key={n.id} className="note-entry">
                <div className="note-meta">
                  <span className="note-author">
                    {n.autor} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({n.cargo})</span>
                  </span>
                  <time className="note-date">{n.fecha}</time>
                </div>
                <div className="note-body">{n.texto}</div>
              </article>
            ))
          )}
        </div>

        {/* Columna Derecha: Formulario para redactar nueva nota */}
        <div>
          <form onSubmit={handleSubmit} className="note-form-card">
            <span className="card-heading" style={{ border: 'none', padding: 0 }}>Agregar Nota Interna</span>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Incorpore constancias de inspección, trámites judiciales o informes dominiales.
            </p>

            <textarea
              required
              rows={5}
              placeholder="Escriba aquí la observación técnica o informe administrativo..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="clean-textarea"
            />

            <button type="submit" className="btn-black" style={{ width: '100%', height: '36px' }}>
              Guardar nota
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
