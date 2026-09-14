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

const CARGO_OPTIONS = [
  'Observatorio Urbano',
  'Dirección de Obras Particulares',
  'Asesoría Letrada Municipal',
  'Inspección Urbana',
  'Dirección de Catastro',
  'Secretaría de Planeamiento',
];

export function AdminFigmaNotas({
  caseData,
  notes,
  onAddNote,
  onBackToCase,
}: AdminFigmaNotasProps) {
  const [newText, setNewText] = useState('');
  const [selectedCargo, setSelectedCargo] = useState(CARGO_OPTIONS[0]);

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
      {/* Navegación */}
      <div>
        <button type="button" onClick={onBackToCase} className="back-link">
          ← Volver al caso {formattedId}
        </button>
      </div>

      {/* Encabezado */}
      <div className="notes-header">
        <h1 className="notes-title">Notas Internas — Caso {formattedId}</h1>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {caseData?.direccion || 'Inmueble sin dirección registrada'} · Distrito {caseData?.distrito || 'CENTRO'}
        </p>
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(181,69,27,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#B5451B',
                        flexShrink: 0,
                      }}
                    >
                      {n.autor.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="note-author">{n.autor}</span>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{n.cargo}</div>
                    </div>
                  </div>
                  <time className="note-date">{n.fecha}</time>
                </div>
                <div className="note-body">{n.texto}</div>
              </article>
            ))
          )}
        </div>

        {/* Columna Derecha: Formulario */}
        <div>
          <form onSubmit={handleSubmit} className="note-form-card">
            <span className="card-heading" style={{ border: 'none', padding: 0 }}>Agregar Nota Interna</span>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Incorpore constancias de inspección, trámites judiciales o informes dominiales.
            </p>

            <div className="form-field">
              <label className="form-label">Área o repartición</label>
              <select
                className="form-select"
                value={selectedCargo}
                onChange={(e) => setSelectedCargo(e.target.value)}
              >
                {CARGO_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Contenido de la nota</label>
              <textarea
                required
                rows={5}
                placeholder="Escriba aquí la observación técnica o informe administrativo..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="clean-textarea"
              />
            </div>

            <button type="submit" className="btn-black" style={{ width: '100%', height: '36px' }}>
              Registrar nota
            </button>
          </form>

          {/* Info sobre la sesión */}
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: '#f5f4f2',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            Las notas se registran en esta sesión de trabajo. En la versión de producción se sincronizarán con el sistema de expedientes municipales.
          </div>
        </div>
      </div>
    </div>
  );
}
