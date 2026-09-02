'use client';

import { useEffect, useRef } from 'react';
import { initMapApp } from '../lib/mapLogic';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapApp() {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            initMapApp();
        }
    }, []);

    return (
        <>
            {/* ========== LOADING SCREEN ========== */}
            <div id="loading-screen">
                <div className="loader-content">
                    <div className="loader-pin">
                        <img src="/image/cariesurbanas.svg" alt="Logo Caries Urbanas" style={{ width: '80px' }} />
                    </div>
                    <h1 className="loader-brand">Caries Urbanas</h1>
                    <p className="loader-text">Cargando observatorio urbano...</p>
                    <div className="loader-bar">
                        <div className="loader-bar-fill" id="loader-bar-fill"></div>
                    </div>
                </div>
            </div>

            {/* ========== MAP ========== */}
            <div id="map"></div>

            {/* ========== TOP UI: SEARCH & STATUS FILTERS ========== */}
            <div id="top-ui">
                <div className="search-inner">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" id="search-input" placeholder="Buscar dirección, lote..." autoComplete="off" />
                    <div id="search-results" className="search-results hidden"></div>
                </div>

                <div className="quick-filters">
                    <button className="chip" data-status="carga"><span className="chip-dot chip-dot-red"></span>En carga</button>
                    <button className="chip" data-status="en_revision"><span className="chip-dot chip-dot-orange"></span>En revisión</button>
                    <button className="chip" data-status="confirmada"><span className="chip-dot chip-dot-green"></span>Confirmadas</button>
                </div>
            </div>

            {/* ========== SIDEBAR (RIGHT FABS) ========== */}
            <div id="right-sidebar">
                <div className="sidebar-fabs">
                    {/* Measure */}
                    <div className="fab-item">
                        <button className="fab" id="fab-measure" title="Herramienta de Medición">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="10" rx="2" ry="2"/><line x1="6" y1="7" x2="6" y2="11"/><line x1="10" y1="7" x2="10" y2="9"/><line x1="14" y1="7" x2="14" y2="11"/><line x1="18" y1="7" x2="18" y2="9"/>
                            </svg>
                        </button>
                        <span className="fab-label">Medir</span>
                    </div>
                    {/* Info */}
                    <div className="fab-item">
                        <button className="fab" id="fab-info" title="Sobre el Proyecto">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                        </button>
                        <span className="fab-label">Info</span>
                    </div>
                    {/* Participate */}
                    <div className="fab-item">
                        <button className="fab" id="fab-participate" title="Participación Ciudadana">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </button>
                        <span className="fab-label">Participar</span>
                    </div>
                    {/* Layers */}
                    <div className="fab-item">
                        <button className="fab" id="fab-layers" title="Capas">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>
                            </svg>
                        </button>
                        <span className="fab-label">Capas</span>
                    </div>
                </div>
            </div>

            {/* ========== BOTTOM PILL (DASHBOARD/STATS) ========== */}
            <div id="bottom-bar-container">
                <button id="btn-open-stats" className="bottom-pill">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 20V10M12 20V4M6 20v-6"/>
                    </svg>
                    <span>Estadísticas del Observatorio</span>
                </button>
            </div>

            {/* ========== MEASURE MODE BANNER ========== */}
            <div id="measure-banner" className="measure-banner hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="2" y="7" width="20" height="10" rx="2" ry="2"/><line x1="6" y1="7" x2="6" y2="11"/><line x1="10" y1="7" x2="10" y2="9"/><line x1="14" y1="7" x2="14" y2="11"/><line x1="18" y1="7" x2="18" y2="9"/>
                </svg>
                Modo medición activo &mdash; tocá el mapa para agregar puntos
            </div>

            {/* ========== ONBOARDING TOUR ========== */}
            <div id="onboarding-tour" className="modal hidden" style={{ zIndex: 9999 }}>
                <div className="modal-overlay" id="tour-overlay" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }}></div>
                
                <div className="tour-card" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-white)', borderRadius: '20px', padding: '24px', width: '300px', zIndex: 10000, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
                        <img src="/image/cariesurbanas.svg" alt="Caries Urbanas Logo" style={{ width: '48px' }} />
                    </div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontFamily: 'var(--font)', fontWeight: 800 }}>¡Bienvenido al Observatorio!</h2>
                    <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-muted)' }}>Te mostramos rápidamente cómo explorar el mapa de Caries Urbanas.</p>
                    <button id="tour-start" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>Comenzar recorrido</button>
                </div>
                
                <div id="tour-highlight-box" style={{ position: 'absolute', border: '3px dashed var(--accent)', borderRadius: '12px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)', pointerEvents: 'none', transition: 'all 0.4s ease', display: 'none', zIndex: 9998 }}></div>
                
                <div id="tour-step-tooltip" style={{ position: 'absolute', background: 'var(--bg-white)', borderRadius: '14px', padding: '16px', width: '260px', zIndex: 9999, display: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', transition: 'all 0.4s ease' }}>
                    <p id="tour-step-text" style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: 1.4, color: 'var(--text-body)' }}></p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span id="tour-step-count" style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>1/3</span>
                        <button id="tour-next" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>Siguiente</button>
                    </div>
                </div>
            </div>

            {/* ========== MODAL: LAYERS ========== */}
            <div id="modal-layers" className="modal hidden">
                <div className="modal-overlay"></div>
                <div className="modal-card bottom-sheet modal-card-sm">
                    <button className="modal-close" data-close="modal-layers">✕</button>
                    <h2 className="modal-title">Capas</h2>
                    <p className="modal-subtitle">Visualización del mapa</p>

                    <div className="layer-group">
                        <h3 className="layer-group-title">Mapa Base</h3>
                        <label className="layer-option">
                            <input type="radio" name="base-map" value="vector" />
                            <span className="radio-custom"></span>
                            Vector Oscuro
                        </label>
                        <label className="layer-option">
                            <input type="radio" name="base-map" value="satellite" defaultChecked />
                            <span className="radio-custom"></span>
                            Satelital (Predeterminado)
                        </label>
                    </div>

                    <div className="layer-group">
                        <h3 className="layer-group-title">Capas de Datos</h3>
                        <label className="layer-option">
                            <input type="checkbox" id="layer-heatmap" />
                            <span className="check-custom"></span>
                            Mapa de Calor
                        </label>
                        <label className="layer-option">
                            <input type="checkbox" id="layer-clusters" />
                            <span className="check-custom"></span>
                            Agrupar Puntos (Clusters)
                        </label>
                        <label className="layer-option">
                            <input type="checkbox" id="layer-districts" defaultChecked />
                            <span className="check-custom"></span>
                            Límites de Distritos
                        </label>
                    </div>

                    <div className="layer-group" style={{ marginTop: '24px' }}>
                        <h3 className="layer-group-title">Filtro de Distrito</h3>
                        <div id="district-checkboxes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                            {/* JS fills this */}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== MODAL: ABOUT / CAROUSEL ========== */}
            <div id="modal-info" className="modal hidden">
                <div className="modal-overlay"></div>
                <div className="modal-card bottom-sheet">
                    <button className="modal-close" data-close="modal-info">✕</button>
                    <div className="modal-carousel" id="info-carousel">
                        {/* Slide 1 */}
                        <div className="carousel-slide active" data-slide="0">
                            <h2 className="modal-title">Caries Urbanas</h2>
                            <p className="modal-subtitle" style={{ fontSize: '10px' }}>Sistema de gestión integral</p>
                            <div className="modal-body">
                                <p><strong>¿QUÉ SON LAS CARIES URBANAS?</strong></p>
                                <p>Inmuebles públicos o privados que se encuentren en gran estado de abandono y que generen un impacto negativo en el entorno urbano.</p>
                                <p style={{ marginTop: '14px', marginBottom: '6px' }}><strong>OBJETIVOS</strong></p>
                                <ul className="icon-list" style={{ fontSize: '12.5px' }}>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> <span>Fortalecer la gestión activa del uso del suelo municipal.</span></li>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> <span>Fomentar el desarrollo urbano, económico y social.</span></li>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> <span>Detectar oportunidades para intervenciones estratégicas y desalentar la especulación.</span></li>
                                </ul>
                            </div>
                        </div>
                        {/* Slide 2 */}
                        <div className="carousel-slide" data-slide="1">
                            <h2 className="modal-title">Criterios</h2>
                            <p className="modal-subtitle" style={{ fontSize: '10px' }}>Calificación de Caries Urbanas</p>
                            <div className="modal-body">
                                <ul className="icon-list" style={{ fontSize: '13px' }}>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><line x1="8" y1="18" x2="8.01" y2="18"/><line x1="16" y1="18" x2="16.01" y2="18"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/></svg> <span><strong>Estado edilicio:</strong> Abandono o desuso por un período superior a 3 años, falta de mantenimiento.</span></li>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg> <span><strong>Estado de mantenimiento:</strong> Incumplimientos en higiene y seguridad.</span></li>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> <span><strong>Situación dominial:</strong> Irregularidades y conflictos legales.</span></li>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg> <span><strong>Servicios públicos:</strong> Inexistencia de conexiones o falta de consumo prolongado.</span></li>
                                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> <span><strong>Situación económica:</strong> Deudas municipales significativas.</span></li>
                                </ul>
                            </div>
                        </div>
                        {/* Slide 3 */}
                        <div className="carousel-slide" data-slide="2">
                            <h2 className="modal-title">Estrategias</h2>
                            <p className="modal-subtitle" style={{ fontSize: '10px' }}>Intervención Urbanística</p>
                            <div className="modal-body" style={{ fontSize: '13px' }}>
                                <p><strong>Grandes áreas de caries urbanas:</strong> Generación de espacios verdes, reservas para el Banco de Tierras, o distritos especiales para vivienda e infraestructura.</p>
                                <p><strong>Inmuebles vacantes individuales:</strong> Evaluación caso por caso para aplicar Tributos, Multas, Convenios Urbanísticos, Bonos de edificabilidad o adquisición.</p>
                                <p><strong>Planes de utilización:</strong> Los propietarios calificados podrán presentar planes para la reactivación de los inmuebles.</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                    <a href="https://drive.google.com/file/d/1CkAC-pHbmfREvxin3budFuWh_AHp-JDN/view?usp=sharing" className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '12px' }} target="_blank" rel="noopener noreferrer">Proyecto Legislativo</a>
                                    <a href="https://lucassimoniello.com.ar/caries-urbanas/" className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '12px' }} target="_blank" rel="noopener noreferrer">Web Oficial</a>
                                </div>
                            </div>
                        </div>
                        {/* Logos Slide */}
                        <div className="carousel-slide" data-slide="3">
                            <h2 className="modal-title">Equipo de Trabajo</h2>
                            <p className="modal-subtitle">Institucional</p>
                            <div className="modal-body align-center">
                                <p>Iniciativa impulsada por:</p>
                                <div className="logos-container">
                                    <a href="https://lucassimoniello.com.ar/" target="_blank" rel="noopener noreferrer"><img src="/image/lucassimoniellosinfondo.png" alt="Lucas Simoniello" className="brand-logo-large" /></a>
                                    <a href="https://encuentrosantafe.com.ar/quienes-somos-2/" target="_blank" rel="noopener noreferrer"><img src="/image/encuentrosinfondo.png" alt="#Encuentro" className="brand-logo-large brand-logo-encuentro-large" /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Carousel controls */}
                    <div className="carousel-controls">
                        <button className="carousel-btn" id="carousel-prev">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <div className="carousel-dots" id="carousel-dots"></div>
                        <button className="carousel-btn" id="carousel-next">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== MODAL: STATS / DASHBOARD ========== */}
            <div id="modal-stats" className="modal hidden">
                <div className="modal-overlay"></div>
                <div className="modal-card bottom-sheet modal-card-wide">
                    <button className="modal-close" data-close="modal-stats">✕</button>
                    <h2 className="modal-title">Observatorio</h2>
                    <p className="modal-subtitle">Análisis espacial del relevamiento · <strong>Actualizado: Junio 2026</strong></p>

                    <div className="stats-grid">
                        <div className="stat-card stat-accent">
                            <div className="stat-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <div className="stat-number" id="stat-total">0</div>
                            <div className="stat-label">Lotes Relevados</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                            </div>
                            <div className="stat-number" id="stat-districts">0</div>
                            <div className="stat-label">Distritos</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            </div>
                            <div className="stat-number" id="stat-zones">0</div>
                            <div className="stat-label">Zonas Inmob.</div>
                        </div>
                        <div className="stat-card stat-critical">
                            <div className="stat-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            </div>
                            <div className="stat-number" id="stat-critical" style={{ fontSize: '18px', paddingTop: '4px' }}>—</div>
                            <div className="stat-label">Distrito Crítico</div>
                        </div>
                    </div>

                    <div className="chart-section" style={{ marginTop: '20px' }}>
                        <h3 className="filter-label">Estado General</h3>
                        <div id="status-donut-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '8px 0' }}>
                            <svg id="status-donut" width="110" height="110" viewBox="0 0 110 110" style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
                                <circle cx="55" cy="55" r="40" fill="none" stroke="var(--border)" strokeWidth="18"/>
                                <circle id="donut-treated"  cx="55" cy="55" r="40" fill="none" stroke="#34A853" strokeWidth="18" strokeLinecap="butt" strokeDasharray="0 251.3"/>
                                <circle id="donut-treating" cx="55" cy="55" r="40" fill="none" stroke="#F9A825" strokeWidth="18" strokeLinecap="butt" strokeDasharray="0 251.3"/>
                                <circle id="donut-untreated" cx="55" cy="55" r="40" fill="none" stroke="#E85D26" strokeWidth="18" strokeLinecap="butt" strokeDasharray="0 251.3"/>
                            </svg>
                            <div id="status-legend" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}></div>
                        </div>
                    </div>

                    <div className="chart-section" style={{ marginTop: '4px' }}>
                        <h3 className="filter-label">Progreso de Resolución</h3>
                        <div style={{ height: '10px', borderRadius: '100px', overflow: 'hidden', display: 'flex', marginTop: '8px', background: 'var(--border)' }}>
                            <div id="prog-treated"  style={{ background: '#34A853', height: '100%', transition: 'width 0.8s var(--ease)' }}></div>
                            <div id="prog-treating" style={{ background: '#F9A825', height: '100%', transition: 'width 0.8s var(--ease)' }}></div>
                            <div id="prog-untreated" style={{ background: '#E85D26', height: '100%', transition: 'width 0.8s var(--ease)' }}></div>
                        </div>
                        <div id="prog-label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}></div>
                    </div>

                    <div className="chart-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <h3 className="filter-label">Distribución por Distrito</h3>
                        <div id="district-chart" className="district-chart"></div>
                    </div>

                    <div className="chart-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                        <h3 className="filter-label">Zonificación (ROU)</h3>
                        <div id="rou-chart" className="district-chart"></div>
                    </div>
                </div>
            </div>

            {/* ========== MODAL: CITIZEN PARTICIPATION ========== */}
            <div id="modal-participate" className="modal hidden">
                <div className="modal-overlay"></div>
                <div className="modal-card bottom-sheet">
                    <button className="modal-close" data-close="modal-participate">✕</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        <div style={{ background: 'var(--accent-10)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="modal-title" style={{ margin: 0, fontSize: '24px' }}>Participación</h2>
                            <p className="modal-subtitle" style={{ margin: '4px 0 0 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Tu voz importa</p>
                        </div>
                    </div>
                    <div className="modal-body">
                        <p>Este observatorio es una herramienta <strong>ciudadana</strong>. Las caries urbanas no son solo un problema del municipio; <strong>son tu problema, son nuestro problema</strong>.</p>
                        <p>¿Conocés un inmueble abandonado, un terreno baldío peligroso o una estructura a punto de colapsar en tu barrio? <strong>Reportalo.</strong></p>
                        
                        <div className="participate-why">
                            <h4>Motivos para participar:</h4>
                            <ul className="icon-list" style={{ marginTop: '10px' }}>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> <span>Tu reporte fortalece la evidencia de la base de datos.</span></li>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> <span>Más datos permiten fundamentar la normativa local.</span></li>
                                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span>Protegés la seguridad de tus vecinos.</span></li>
                            </ul>
                        </div>
                        <form id="denuncia-form" style={{ marginTop: '20px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label className="filter-label" htmlFor="denuncia-tipo">Tipo de reporte *</label>
                                <select name="tipo" id="denuncia-tipo" className="ui-select" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="baldio">Terreno baldío</option>
                                    <option value="casa_abandonada">Casa abandonada</option>
                                    <option value="ambiental">Problema ambiental</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label className="filter-label" htmlFor="denuncia-desc">Descripción *</label>
                                <textarea name="descripcion" id="denuncia-desc" className="ui-select" rows={3} placeholder="Describí el problema (mínimo 10 caracteres)" required minLength={10} maxLength={1000} style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}></textarea>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label className="filter-label" htmlFor="denuncia-dir">Dirección (opcional)</label>
                                <input type="text" name="direccion" id="denuncia-dir" className="ui-select" placeholder="Ej: Rivadavia al 3400" />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="filter-label" htmlFor="denuncia-contacto">Contacto (opcional)</label>
                                <input type="text" name="contacto" id="denuncia-contacto" className="ui-select" placeholder="Teléfono o email" maxLength={200} />
                            </div>
                            <p id="denuncia-msg" style={{ fontSize: '13px', marginBottom: '10px', minHeight: '18px', fontWeight: 500 }}></p>
                            <button type="submit" id="denuncia-submit" className="btn-primary btn-full">
                                Enviar Denuncia
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* ========== FEATURE DETAIL (BOTTOM SHEET) ========== */}
            <div id="feature-detail" className="feature-detail hidden">
                <button id="detail-close" className="detail-close" style={{ zIndex: 10 }}>✕</button>
                
                <div className="detail-header" style={{ marginBottom: '12px', paddingRight: '24px' }}>
                    <span id="detail-badge" className="detail-badge">LOTE</span>
                    <h2 id="detail-title" className="detail-title" style={{ marginTop: '6px' }}>—</h2>
                </div>

                <div id="detail-image-container" style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', display: 'none', background: 'var(--bg-off)', position: 'relative', border: '1px solid var(--border)' }}>
                    <img id="detail-image" alt="Vista del Inmueble" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', backdropFilter: 'blur(2px)', fontWeight: 500 }}>Registro Visual</div>
                </div>

                <div className="detail-rows">
                    <div className="detail-row">
                        <span className="detail-key">Dirección</span>
                        <span className="detail-val" id="detail-address">—</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-key">Distrito</span>
                        <span className="detail-val" id="detail-district">—</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-key">Zona Inmobiliaria</span>
                        <span className="detail-val" id="detail-zone">—</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-key">ID Relevamiento</span>
                        <span className="detail-val" id="detail-id">—</span>
                    </div>
                </div>
                
                <div className="detail-actions" style={{ marginTop: '10px' }}>
                    <button className="btn-secondary btn-full" id="detail-btn-fly">
                        Centrar en Mapa
                    </button>
                </div>
            </div>

            {/* ========== MEASURE TOOLTIP ========== */}
            <div id="measure-bar" className="measure-bar hidden">
                <span id="measure-text">Clic para medir</span>
                <button id="measure-finish" className="btn-primary" style={{ padding: '4px 12px', fontSize: '11px', marginLeft: '8px', borderRadius: '20px' }}>&#10003; Listo</button>
                <button id="measure-clear" className="measure-clear" title="Limpiar medición">×</button>
            </div>
        </>
    );
}
