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

export function loginDemo(rol: 'admin' | 'tecnico' | 'lectura' = 'admin') {
  setToken('demo-token');
  setUser('Observador Técnico', rol);
}

// Catálogos
export interface CatalogoItem { id: number; nombre: string; }
export interface Catalogos {
  tipos_relevamiento: CatalogoItem[];
  distritos: CatalogoItem[];
  vecinales: CatalogoItem[];
  zonas_inmobiliarias: CatalogoItem[];
}

export async function fetchCatalogos(): Promise<Catalogos> {
  if (getToken() === 'demo-token') {
    return {
      tipos_relevamiento: [{ id: 1, nombre: 'carie' }, { id: 2, nombre: 'vacancia' }],
      distritos: [
        { id: 1, nombre: 'CENTRO' },
        { id: 2, nombre: 'ESTE' },
        { id: 3, nombre: 'LA COSTA' },
        { id: 4, nombre: 'NORESTE' },
        { id: 5, nombre: 'NOROESTE' },
        { id: 6, nombre: 'NORTE' },
        { id: 7, nombre: 'OESTE' },
        { id: 8, nombre: 'SUROESTE' },
      ],
      vecinales: [
        { id: 1, nombre: 'Barrio Sur' },
        { id: 2, nombre: 'Candioti Sur' },
        { id: 3, nombre: 'Candioti Norte' },
      ],
      zonas_inmobiliarias: [
        { id: 1, nombre: '1' },
        { id: 2, nombre: '2' },
        { id: 3, nombre: '3' },
        { id: 4, nombre: '4' },
      ],
    };
  }
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

// Cache local de GeoJSON para modo demo
let demoGeoJsonCache: any = null;

export async function fetchRelevamientos(params: ListadoParams = {}): Promise<ListadoResponse> {
  if (getToken() === 'demo-token') {
    if (!demoGeoJsonCache) {
      const res = await fetch(`${API_URL}/public/inmuebles.geojson`);
      demoGeoJsonCache = await res.json();
    }

    let list: any[] = demoGeoJsonCache.features || [];

    // Filtros
    if (params.q) {
      const q = params.q.toLowerCase().trim();
      list = list.filter((f) =>
        (f.properties.direccion || '').toLowerCase().includes(q) ||
        (f.properties.nombre || '').toLowerCase().includes(q) ||
        (f.properties.distrito || '').toLowerCase().includes(q) ||
        String(f.properties.nro_relevamiento || f.id).includes(q)
      );
    }

    if (params.estado) {
      list = list.filter((f) => (f.properties.estado_registro || 'carga') === params.estado);
    }

    if (params.tipo) {
      list = list.filter((f) => f.properties.tipo === params.tipo);
    }

    if (params.distrito_id) {
      const distritosMap: Record<number, string> = {
        1: 'CENTRO', 2: 'ESTE', 3: 'LA COSTA', 4: 'NORESTE',
        5: 'NOROESTE', 6: 'NORTE', 7: 'OESTE', 8: 'SUROESTE'
      };
      const dName = distritosMap[params.distrito_id];
      if (dName) {
        list = list.filter((f) => f.properties.distrito === dName);
      }
    }

    const total = list.length;
    const pagina = params.pagina || 1;
    const tamanio = params.tamanio || 25;
    const start = (pagina - 1) * tamanio;
    const paged = list.slice(start, start + tamanio);

    const items: RelevamientoResumen[] = paged.map((f: any) => ({
      id: f.id,
      nro_relevamiento: f.properties.nro_relevamiento,
      tipo: f.properties.tipo,
      nombre: f.properties.nombre,
      direccion: f.properties.direccion,
      distrito: f.properties.distrito,
      estado_registro: f.properties.estado_registro || 'carga',
      patrimonio: f.properties.patrimonio || false,
      lat: f.geometry?.coordinates ? f.geometry.coordinates[1] : null,
      lng: f.geometry?.coordinates ? f.geometry.coordinates[0] : null,
      actualizado_en: f.properties.actualizado_en || new Date().toISOString(),
    }));

    return { total, pagina, tamanio, items };
  }

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

export async function fetchFichaCompleta(id: number): Promise<FichaCompleta> {
  if (getToken() === 'demo-token') {
    // Intentar buscar los datos públicos reales primero
    let publicData: any = null;
    try {
      const res = await fetch(`${API_URL}/public/inmuebles/${id}`);
      if (res.ok) publicData = await res.json();
    } catch {}

    return {
      id,
      nro_relevamiento: publicData?.nro_relevamiento ?? id,
      tipo: publicData?.tipo ?? 'carie',
      nombre: publicData?.nombre ?? 'Inmueble relevado',
      direccion: publicData?.direccion ?? 'San Martín 1234',
      descripcion: publicData?.descripcion ?? 'Predio en estado de abandono sin mantenimiento ni cerramiento reglamentario.',
      distrito: publicData?.distrito ?? 'CENTRO',
      vecinal: publicData?.vecinal ?? 'Barrio Sur',
      zona_inmobiliaria: publicData?.zona_inmobiliaria ?? '4',
      rou: publicData?.rou ?? 'R6',
      patrimonio: publicData?.patrimonio ?? false,
      patrimonio_tipo: publicData?.patrimonio_tipo ?? 'ninguno',
      manzana: publicData?.manzana ?? '0123',
      superficie_terreno_m2: '480.00',
      sup_construida_m2: '312.50',
      plano_registrado_anio: 1974,
      estado_registro: publicData?.estado_registro ?? 'carga',
      motivo_baja: null,
      lat: publicData?.lat ?? -31.63822,
      lng: publicData?.lng ?? -60.70241,
      geo_fuente: publicData?.geo_fuente ?? 'tablero',
      geo_verificado: publicData?.geo_verificado ?? true,
      activo: true,
      fichaje: false,
      creado_en: publicData?.creado_en ?? '2026-08-28T14:02:00.000Z',
      actualizado_en: publicData?.actualizado_en ?? new Date().toISOString(),
      padrones: ['11588', '11589'],
      partidas: ['1010203040506070'],
      proyectos: [
        {
          id: 3,
          numero_expediente: 'CM-2025-0412',
          titulo: 'Declaración de Interés Municipal y Tratamiento de Inmuebles en Desuso',
          estado: 'Comisión de Gobierno',
          numero_resolucion: null,
        },
      ],
      datos_pendientes: [
        { campo: 'partida_inmobiliaria', estado: 'pendiente', nota: 'Aguardando cruce con API provincial' },
      ],
      historial_estados: [
        { estado: 'carga', fecha: '2026-08-28T00:00:00.000Z', nota: 'Alta inicial desde planilla oficial.', usuario: 'Solange' },
      ],
      titulares: [
        {
          titular_id: 88,
          nombre: 'PÉREZ JUAN CARLOS',
          tipo: 'fisica',
          dni: '12345678',
          cuit: '20123456789',
          domicilio_fiscal: 'San Martín 1234, Santa Fe',
          estado_supervivencia: 'en_vida',
          porcentaje: '50.0000',
          porcentaje_valido: true,
          rol: 'condomino',
          fuente: 'provincial_scit',
        },
        {
          titular_id: 89,
          nombre: 'PÉREZ MARÍA ELENA',
          tipo: 'fisica',
          dni: '14567890',
          cuit: '27145678904',
          domicilio_fiscal: '25 de Mayo 1900, Santa Fe',
          estado_supervivencia: 'fallecido',
          porcentaje: '50.0000',
          porcentaje_valido: true,
          rol: 'sucesion',
          fuente: 'provincial_scit',
        },
      ],
      contactos: [
        { id: 5, titular_id: null, nombre: 'Vecino lindero (1236)', vinculo: 'vecino', tipo: 'telefono', valor: '342-5551234', nota: 'Denunció malezas' },
      ],
      titularidad_calidad: [
        { fuente: 'provincial_scit', cantidad_titulares: 2, suma_porcentaje: '100.0000', suma_valida: true, porcentajes_validos: true },
      ],
    };
  }
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

export async function fetchDenuncias(params: { pagina?: number; tamanio?: number; estado?: string } = {}): Promise<DenunciasResponse> {
  if (getToken() === 'demo-token') {
    const demoItems: Denuncia[] = [
      {
        id: 14,
        origen: 'web',
        tipo: 'baldio',
        estado: 'pendiente',
        direccion: 'Rivadavia al 3400',
        descripcion: 'Terreno baldío con pastos de más de 1.5m de altura, acumulación de basura y roedores.',
        lat: -31.64,
        lng: -60.70,
        relevamiento_id: null,
        tiene_contacto: true,
        creado_en: '2026-09-02T19:20:00.000Z',
      },
      {
        id: 13,
        origen: 'web',
        tipo: 'casa_abandonada',
        estado: 'en_curso',
        direccion: 'San Jerónimo 2150',
        descripcion: 'Inmueble con fachada deteriorada y riesgo de desprendimiento de mampostería sobre peatones.',
        lat: -31.648,
        lng: -60.71,
        relevamiento_id: 455,
        tiene_contacto: false,
        creado_en: '2026-09-01T15:10:00.000Z',
      },
      {
        id: 12,
        origen: 'linea_0800',
        tipo: 'ambiental',
        estado: 'resuelta',
        direccion: 'Bv. Pellegrini y 4 de Enero',
        descripcion: 'Acumulación de agua estancada en estructura a medio demoler. Desinfección efectuada.',
        lat: -31.632,
        lng: -60.705,
        relevamiento_id: 12,
        tiene_contacto: true,
        creado_en: '2026-08-30T11:45:00.000Z',
      },
    ];

    let filtered = demoItems;
    if (params.estado) {
      filtered = filtered.filter((d) => d.estado === params.estado);
    }

    return {
      total: filtered.length,
      pagina: params.pagina || 1,
      tamanio: params.tamanio || 25,
      items: filtered,
    };
  }

  const query = new URLSearchParams();
  if (params.pagina) query.set('pagina', String(params.pagina));
  if (params.tamanio) query.set('tamanio', String(params.tamanio));
  if (params.estado) query.set('estado', params.estado);
  const qs = query.toString();
  return apiAdmin<DenunciasResponse>(`/admin/denuncias${qs ? `?${qs}` : ''}`);
}
