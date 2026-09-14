'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AdminCrudModalProps {
  mode: 'add' | 'edit';
  initialData?: {
    id?: number;
    direccion?: string;
    distrito?: string;
    tipo?: string;
    patrimonio?: boolean;
    notas?: string;
  };
  onClose: () => void;
  onSave: (data: any) => void;
}

const DISTRITOS = ['CENTRO', 'ESTE', 'SUROESTE', 'OESTE', 'NORTE', 'NORESTE', 'NOROESTE'];

export function AdminCrudModal({ mode, initialData = {}, onClose, onSave }: AdminCrudModalProps) {
  const [direccion, setDireccion] = useState(initialData.direccion ?? '');
  const [distrito, setDistrito] = useState(initialData.distrito ?? 'CENTRO');
  const [tipo, setTipo] = useState(initialData.tipo ?? 'carie');
  const [patrimonio, setPatrimonio] = useState(initialData.patrimonio ?? false);
  const [notas, setNotas] = useState(initialData.notas ?? '');
  const [visible, setVisible] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Animacion de entrada
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 180);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) handleClose();
  }

  function handleSave() {
    onSave({ id: initialData.id, direccion, distrito, tipo, patrimonio, notas });
    handleClose();
  }

  const title = mode === 'add' ? 'Agregar Inmueble' : 'Editar Inmueble';

  return (
    <>
      <style>{`
        .crud-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.18s ease;
        }
        .crud-modal-overlay.hidden { opacity: 0; pointer-events: none; }
        .crud-modal {
          background: #fff;
          border-radius: 12px;
          padding: 28px 28px 24px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.22);
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .crud-modal.hidden { transform: translateY(16px); opacity: 0; }
        .crud-modal-title {
          font-family: var(--font-heading, sans-serif);
          font-size: 17px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 20px;
        }
        .crud-form { display: flex; flex-direction: column; gap: 14px; }
        .form-field { display: flex; flex-direction: column; gap: 4px; }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .form-input, .form-select {
          border: 1.5px solid #d1d5db;
          border-radius: 7px;
          padding: 8px 10px;
          font-size: 13px;
          color: #111827;
          outline: none;
          transition: border-color 0.14s;
          background: #fafafa;
          width: 100%;
          box-sizing: border-box;
        }
        .form-input:focus, .form-select:focus {
          border-color: #B5451B;
          background: #fff;
        }
        .form-checkbox-row { display: flex; align-items: center; gap: 8px; }
        .form-checkbox-row input[type="checkbox"] {
          width: 16px; height: 16px;
          accent-color: #B5451B;
          cursor: pointer;
        }
        .crud-modal-actions { display: flex; gap: 10px; margin-top: 22px; }
        .btn-black {
          background: #111827; color: #fff;
          border: none; border-radius: 7px;
          padding: 0 18px; height: 38px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; flex: 1;
          transition: background 0.14s;
        }
        .btn-black:hover { background: #1f2937; }
        .btn-outline {
          background: transparent; color: #374151;
          border: 1.5px solid #d1d5db; border-radius: 7px;
          padding: 0 18px; height: 38px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; flex: 1;
          transition: border-color 0.14s, color 0.14s;
        }
        .btn-outline:hover { border-color: #9ca3af; color: #111827; }
      `}</style>

      <div
        ref={overlayRef}
        className={`crud-modal-overlay${visible ? '' : ' hidden'}`}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={`crud-modal${visible ? '' : ' hidden'}`}>
          <div className="crud-modal-title">{title}</div>

          <div className="crud-form">
            {/* Direccion */}
            <div className="form-field">
              <label className="form-label" htmlFor="crud-direccion">Direccion</label>
              <input
                id="crud-direccion"
                type="text"
                className="form-input"
                placeholder="Ej: San Martin 1234"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            {/* Distrito */}
            <div className="form-field">
              <label className="form-label" htmlFor="crud-distrito">Distrito</label>
              <select
                id="crud-distrito"
                className="form-select"
                value={distrito}
                onChange={(e) => setDistrito(e.target.value)}
              >
                {DISTRITOS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div className="form-field">
              <label className="form-label" htmlFor="crud-tipo">Tipo</label>
              <select
                id="crud-tipo"
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="carie">Carie urbana</option>
                <option value="vacancia">Vacancia</option>
              </select>
            </div>

            {/* Patrimonio */}
            <div className="form-field">
              <label className="form-label">Patrimonio</label>
              <div className="form-checkbox-row">
                <input
                  id="crud-patrimonio"
                  type="checkbox"
                  checked={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.checked)}
                />
                <label htmlFor="crud-patrimonio" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                  Inmueble de valor patrimonial
                </label>
              </div>
            </div>

            {/* Notas */}
            <div className="form-field">
              <label className="form-label" htmlFor="crud-notas">Notas</label>
              <textarea
                id="crud-notas"
                className="form-input"
                placeholder="Observaciones opcionales..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                style={{ resize: 'vertical', lineHeight: 1.4 }}
              />
            </div>
          </div>

          <div className="crud-modal-actions">
            <button className="btn-outline" onClick={handleClose}>Cancelar</button>
            <button className="btn-black" onClick={handleSave}>Guardar</button>
          </div>
        </div>
      </div>
    </>
  );
}
