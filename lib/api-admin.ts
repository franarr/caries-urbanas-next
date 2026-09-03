'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cariesbackend-production.up.railway.app/api';

// ─── Errores tipados ────────────────────────────────────
export class SesionVencida extends Error {
  constructor() { super('Sesión vencida'); this.name = 'SesionVencida'; }
}

export class ErrorApi extends Error {
  status: number;
  detalles: string[];
  constructor(status: number, detalles: string[]) {
    super(detalles.join('. '));
    this.name = 'ErrorApi';
    this.status = status;
    this.detalles = detalles;
  }
}

// ─── Token helpers ──────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('caries_token');
}

export function setToken(token: string) {
  sessionStorage.setItem('caries_token', token);
}

export function clearSession() {
  sessionStorage.removeItem('caries_token');
  sessionStorage.removeItem('caries_user');
}

export function getUser(): { nombre: string; rol: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('caries_user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(nombre: string, rol: string) {
  sessionStorage.setItem('caries_user', JSON.stringify({ nombre, rol }));
}

// ─── Cliente HTTP genérico ──────────────────────────────
export async function apiAdmin<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = getToken();
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  if (respuesta.status === 401) {
    clearSession();
    throw new SesionVencida();
  }

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}));
    const detalle = cuerpo.message ?? cuerpo.mensaje ?? 'Error inesperado';
    throw new ErrorApi(respuesta.status, Array.isArray(detalle) ? detalle : [detalle]);
  }

  return respuesta.json() as Promise<T>;
}

// ─── Endpoints tipados ──────────────────────────────────

// Auth
export interface LoginResponse {
  token: string;
  nombre: string;
  rol: 'admin' | 'tecnico' | 'lectura';
}

export async function login(email: string, contrasena: string): Promise<LoginResponse> {
  const data = await apiAdmin<LoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, contrasena }),
  });
  setToken(data.token);
  setUser(data.nombre, data.rol);
  return data;
}

// Catálogos
export interface CatalogoItem { id: number; nombre: string; }
export interface Catalogos {
  tipos_relevamiento: CatalogoItem[];
  distritos: CatalogoItem[];
  vecinales: CatalogoItem[];
  zonas_inmobiliarias: CatalogoItem[];
}

export function fetchCatalogos() {
  return apiAdmin<Catalogos>('/admin/catalogos');
}

// Relevamientos (listado)
export interface RelevamientoResumen {
  id: number;
  nro_relevamiento: number | null;
  tipo: string;
  nombre: string | null;
  direccion: string | null;
  distrito: string | null;
  estado_registro: string;
  patrimonio: boolean;
  lat: number | null;
  lng: number | null;
  actualizado_en: string;
}

export interface ListadoResponse {
  total: number;
  pagina: number;
  tamanio: number;
  items: RelevamientoResumen[];
}

export interface ListadoParams {
  pagina?: number;
  tamanio?: number;
  estado?: string;
  tipo?: string;
  distrito_id?: number | null;
  q?: string;
}

export function fetchRelevamientos(params: ListadoParams = {}) {
  const query = new URLSearchParams();
  if (params.pagina) query.set('pagina', String(params.pagina));
  if (params.tamanio) query.set('tamanio', String(params.tamanio));
  if (params.estado) query.set('estado', params.estado);
  if (params.tipo) query.set('tipo', params.tipo);
  if (params.distrito_id) query.set('distrito_id', String(params.distrito_id));
  if (params.q) query.set('q', params.q);
  const qs = query.toString();
  return apiAdmin<ListadoResponse>(`/admin/relevamientos${qs ? `?${qs}` : ''}`);
}

// Ficha completa (auditado)
export interface Titular {
  titular_id: number;
  nombre: string;
  tipo: string;
  dni: string | null;
  cuit: string | null;
  domicilio_fiscal: string | null;
  estado_supervivencia: string;
  porcentaje: string;
  porcentaje_valido: boolean;
  rol: string;
  fuente: string;
}

export interface Contacto {
  id: number;
  titular_id: number | null;
  nombre: string;
  vinculo: string;
  tipo: string;
  valor: string;
  nota: string | null;
}

export interface HistorialEstado {
  estado: string;
  fecha: string;
  nota: string | null;
  usuario: string;
}

export interface DatoPendiente {
  campo: string;
  estado: string;
  nota: string | null;
}

export interface Proyecto {
  id: number;
  numero_expediente: string;
  titulo: string;
  estado: string;
  numero_resolucion: string | null;
}

export interface TitularidadCalidad {
  fuente: string;
  cantidad_titulares: number;
  suma_porcentaje: string;
  suma_valida: boolean;
  porcentajes_validos: boolean;
}

export interface FichaCompleta {
  id: number;
  nro_relevamiento: number | null;
  tipo: string;
  nombre: string | null;
  direccion: string | null;
  descripcion: string | null;
  distrito: string | null;
  vecinal: string | null;
  zona_inmobiliaria: string | null;
  rou: string | null;
  patrimonio: boolean;
  patrimonio_tipo: string;
  manzana: string | null;
  superficie_terreno_m2: string | null;
  sup_construida_m2: string | null;
  plano_registrado_anio: number | null;
  estado_registro: string;
  motivo_baja: string | null;
  lat: number | null;
  lng: number | null;
  geo_fuente: string;
  geo_verificado: boolean;
  activo: boolean;
  fichaje: boolean;
  creado_en: string;
  actualizado_en: string;
  padrones: string[];
  partidas: string[];
  proyectos: Proyecto[];
  datos_pendientes: DatoPendiente[];
  historial_estados: HistorialEstado[];
  // Solo para admin/tecnico (ausentes para lectura)
  titulares?: Titular[];
  contactos?: Contacto[];
  titularidad_calidad?: TitularidadCalidad[];
}

export function fetchFichaCompleta(id: number) {
  return apiAdmin<FichaCompleta>(`/admin/relevamientos/${id}/completo`);
}

// Denuncias
export interface Denuncia {
  id: number;
  origen: string;
  tipo: string;
  estado: string;
  direccion: string | null;
  descripcion: string;
  lat: number | null;
  lng: number | null;
  relevamiento_id: number | null;
  tiene_contacto: boolean;
  creado_en: string;
}

export interface DenunciasResponse {
  total: number;
  pagina: number;
  tamanio: number;
  items: Denuncia[];
}

export function fetchDenuncias(params: { pagina?: number; tamanio?: number; estado?: string } = {}) {
  const query = new URLSearchParams();
  if (params.pagina) query.set('pagina', String(params.pagina));
  if (params.tamanio) query.set('tamanio', String(params.tamanio));
  if (params.estado) query.set('estado', params.estado);
  const qs = query.toString();
  return apiAdmin<DenunciasResponse>(`/admin/denuncias${qs ? `?${qs}` : ''}`);
}
