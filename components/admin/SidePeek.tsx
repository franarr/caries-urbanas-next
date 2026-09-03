'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFichaCompleta, FichaCompleta } from '@/lib/api-admin';
import { useAdminStore } from '@/lib/store';
import { FichaSection } from '@/components/admin/FichaSection';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  X,
  ExternalLink,
  MapPin,
  Building,
  Users,
  Phone,
  History,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Loader2,
  Calendar,
  Compass,
} from 'lucide-react';

export function SidePeek() {
  const { selectedId, peekOpen, closePeek } = useAdminStore();

  // Fetch auditado de la ficha completa (solo cuando está abierto y hay ID seleccionado)
  const { data: ficha, isLoading, isError, error } = useQuery<FichaCompleta>({
    queryKey: ['ficha-completa', selectedId],
    queryFn: () => fetchFichaCompleta(selectedId!),
    enabled: !!selectedId && peekOpen,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePeek();
    };
    if (peekOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [peekOpen, closePeek]);

  if (!peekOpen) return null;

  const formatDateSafe = (isoDate: string | null | undefined) => {
    if (!isoDate) return '—';
    // Ojo con fechas medianoche UTC: cortar slice(0, 10) según APICARIES §3
    const datePart = isoDate.slice(0, 10);
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const hasTitulares = ficha && 'titulares' in ficha;

  return (
    <>
      <div className={`side-peek-overlay ${peekOpen ? 'open' : ''}`} onClick={closePeek} />

      <aside className={`side-peek ${peekOpen ? 'open' : ''}`} aria-label="Ficha de Relevamiento">
        <div className="side-peek-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 700 }}>
                LOTE #{String(ficha?.nro_relevamiento ?? selectedId).padStart(3, '0')}
              </span>
              {ficha && <StatusBadge estado={ficha.estado_registro} size="sm" />}
            </div>
            <h2 className="side-peek-title">
              {ficha?.direccion || ficha?.nombre || 'Cargando datos del lote...'}
            </h2>
          </div>

          <button className="side-peek-close" onClick={closePeek} title="Cerrar panel">
            <X size={18} />
          </button>
        </div>

        <div className="side-peek-body">
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px', color: 'var(--text-muted)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.875rem' }}>Recuperando expediente auditado...</span>
            </div>
          )}

          {isError && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(217, 48, 37, 0.08)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontSize: '0.875rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>No se pudo cargar la ficha</p>
              <p style={{ fontSize: '0.8125rem' }}>
                {(error as Error)?.message || 'Ocurrió un error al consultar el endpoint auditado.'}
              </p>
            </div>
          )}

          {ficha && (
            <>
              {/* Descripción si la tiene */}
              {ficha.descripcion && (
                <div style={{ padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-body)', borderLeft: '3px solid var(--accent)' }}>
                  “{ficha.descripcion}”
                </div>
              )}

              {/* SECCIÓN 1: Identificación y Territorio */}
              <FichaSection title="Identificación y Territorio" icon={<MapPin size={15} color="var(--accent)" />} defaultOpen={true}>
                <div className="ficha-row">
                  <span className="ficha-key">Distrito</span>
                  <span className="ficha-val">{ficha.distrito || '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Vecinal</span>
                  <span className="ficha-val">{ficha.vecinal || '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Zona Inmobiliaria</span>
                  <span className="ficha-val">Zona {ficha.zona_inmobiliaria || '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">ROU</span>
                  <span className="ficha-val" style={{ fontFamily: 'var(--font-mono)' }}>{ficha.rou || '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Manzana</span>
                  <span className="ficha-val">{ficha.manzana || '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Tipo de Relevamiento</span>
                  <span className="ficha-val" style={{ textTransform: 'capitalize' }}>{ficha.tipo}</span>
                </div>
              </FichaSection>

              {/* SECCIÓN 2: Catastro y Superficie */}
              <FichaSection title="Catastro y Superficie" icon={<Building size={15} color="var(--accent)" />} defaultOpen={true}>
                <div className="ficha-row">
                  <span className="ficha-key">Sup. Terreno</span>
                  <span className="ficha-val">{ficha.superficie_terreno_m2 ? `${ficha.superficie_terreno_m2} m²` : '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Sup. Construida</span>
                  <span className="ficha-val">{ficha.sup_construida_m2 ? `${ficha.sup_construida_m2} m²` : '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Año Plano Registrado</span>
                  <span className="ficha-val">{ficha.plano_registrado_anio || '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Padrones (Municipal)</span>
                  <span className="ficha-val" style={{ fontFamily: 'var(--font-mono)' }}>
                    {ficha.padrones?.length ? ficha.padrones.join(', ') : '—'}
                  </span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Partidas (Provincial)</span>
                  <span className="ficha-val" style={{ fontFamily: 'var(--font-mono)' }}>
                    {ficha.partidas?.length ? ficha.partidas.join(', ') : '—'}
                  </span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Patrimonio Histórico</span>
                  <span className="ficha-val">
                    {ficha.patrimonio ? (
                      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                        Sí ({ficha.patrimonio_tipo})
                      </span>
                    ) : (
                      'No'
                    )}
                  </span>
                </div>
              </FichaSection>

              {/* SECCIÓN 3: Coordenadas y Enlaces */}
              <FichaSection title="Geolocalización" icon={<Compass size={15} color="var(--accent)" />} defaultOpen={false}>
                <div className="ficha-row">
                  <span className="ficha-key">Coordenadas</span>
                  <span className="ficha-val" style={{ fontFamily: 'var(--font-mono)' }}>
                    {ficha.lat && ficha.lng ? `${ficha.lat.toFixed(5)}, ${ficha.lng.toFixed(5)}` : 'Sin ubicar'}
                  </span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Fuente Geográfica</span>
                  <span className="ficha-val" style={{ textTransform: 'capitalize' }}>{ficha.geo_fuente || '—'}</span>
                </div>
                <div className="ficha-row">
                  <span className="ficha-key">Geometría Verificada</span>
                  <span className="ficha-val">
                    {ficha.geo_verificado ? (
                      <span style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Verificada
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Pendiente</span>
                    )}
                  </span>
                </div>
                {ficha.direccion && (
                  <div style={{ marginTop: '12px' }}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ficha.direccion}, Santa Fe, Argentina`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary btn-full"
                      style={{ fontSize: '0.8125rem', padding: '8px 12px' }}
                    >
                      <ExternalLink size={13} style={{ marginRight: '6px' }} />
                      Ver ubicación en Google Maps
                    </a>
                  </div>
                )}
              </FichaSection>

              {/* SECCIÓN 4: Titulares de Dominio (Ley 25.326) */}
              <FichaSection
                title="Titularidad (SCIT)"
                icon={<Users size={15} color="var(--accent)" />}
                defaultOpen={true}
                badge={hasTitulares && ficha.titulares ? `${ficha.titulares.length}` : undefined}
              >
                {!hasTitulares ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    <Lock size={14} />
                    <span>Datos de titulares restringidos para perfil de lectura (Ley 25.326).</span>
                  </div>
                ) : ficha.titulares && ficha.titulares.length > 0 ? (
                  <div>
                    {/* Diagnóstico de titularidad */}
                    {ficha.titularidad_calidad?.map((calidad, idx) => (
                      <div key={idx} style={{ marginBottom: '12px', padding: '8px 12px', background: calidad.suma_valida ? 'rgba(52, 168, 83, 0.08)' : 'rgba(249, 168, 37, 0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Fuente: <strong>{calidad.fuente}</strong> ({calidad.cantidad_titulares} titulares)</span>
                        <span>Suma: <strong>{calidad.suma_porcentaje}%</strong> {calidad.suma_valida ? '✓' : '⚠️'}</span>
                      </div>
                    ))}

                    {/* Lista de titulares ordenados por procedencia */}
                    {ficha.titulares.map((tit) => (
                      <div key={tit.titular_id} className="titular-card">
                        <div className="titular-name">
                          <span>{tit.nombre}</span>
                          <span className="titular-badge" style={{ backgroundColor: tit.estado_supervivencia === 'fallecido' ? 'rgba(217, 48, 37, 0.15)' : '#EFEFEF', color: tit.estado_supervivencia === 'fallecido' ? 'var(--red)' : 'var(--text-body)' }}>
                            {tit.estado_supervivencia}
                          </span>
                        </div>

                        <div className="titular-meta">
                          <div>
                            <div className="ficha-key">Identificación</div>
                            <div className="ficha-val" style={{ textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
                              {tit.cuit ? `CUIT ${tit.cuit}` : tit.dni ? `DNI ${tit.dni}` : '—'}
                            </div>
                          </div>
                          <div>
                            <div className="ficha-key">Participación</div>
                            <div className="ficha-val" style={{ textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>
                              {tit.porcentaje}% ({tit.rol})
                            </div>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div className="ficha-key">Fuente Registral</div>
                            <div className="ficha-val" style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                              {tit.fuente}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No se registran titulares en esta ficha.</p>
                )}
              </FichaSection>

              {/* SECCIÓN 5: Contactos */}
              {hasTitulares && ficha.contactos && ficha.contactos.length > 0 && (
                <FichaSection title="Contactos Barriales" icon={<Phone size={15} color="var(--accent)" />} defaultOpen={false}>
                  {ficha.contactos.map((c) => (
                    <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px dotted var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.nombre} ({c.vinculo})</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.tipo}: {c.valor}</div>
                    </div>
                  ))}
                </FichaSection>
              )}

              {/* SECCIÓN 6: Historial del Relevamiento */}
              {ficha.historial_estados && ficha.historial_estados.length > 0 && (
                <FichaSection title="Historial del Estado" icon={<History size={15} color="var(--accent)" />} defaultOpen={false}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ficha.historial_estados.map((h, idx) => (
                      <div key={idx} style={{ paddingLeft: '12px', borderLeft: '2px solid var(--border-dark)', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StatusBadge estado={h.estado} size="sm" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatDateSafe(h.fecha)}
                          </span>
                        </div>
                        {h.nota && <p style={{ fontSize: '0.8125rem', marginTop: '4px', color: 'var(--text-body)' }}>{h.nota}</p>}
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Por: {h.usuario}
                        </div>
                      </div>
                    ))}
                  </div>
                </FichaSection>
              )}

              {/* SECCIÓN 7: Proyectos y Expedientes */}
              {ficha.proyectos && ficha.proyectos.length > 0 && (
                <FichaSection title="Proyectos Concejo" icon={<FileText size={15} color="var(--accent)" />} defaultOpen={false}>
                  {ficha.proyectos.map((p) => (
                    <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px dotted var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                        Exp. {p.numero_expediente}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-dark)' }}>{p.titulo}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-dark)' }}>{p.estado}</div>
                    </div>
                  ))}
                </FichaSection>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
