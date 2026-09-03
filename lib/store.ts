import { create } from 'zustand';

interface AdminState {
  // Ficha seleccionada
  selectedId: number | null;
  peekOpen: boolean;
  selectRelevamiento: (id: number) => void;
  closePeek: () => void;

  // Filtros del listado
  filtros: {
    q: string;
    estado: string;
    tipo: string;
    distrito_id: number | null;
    pagina: number;
  };
  setFiltro: (key: string, value: any) => void;
  resetFiltros: () => void;

  // Mobile: vista activa
  mobileView: 'list' | 'map';
  setMobileView: (view: 'list' | 'map') => void;

  // Hover sobre fila (para resaltar pin en el mapa)
  hoveredId: number | null;
  setHoveredId: (id: number | null) => void;
}

const filtrosDefault = {
  q: '',
  estado: '',
  tipo: '',
  distrito_id: null as number | null,
  pagina: 1,
};

export const useAdminStore = create<AdminState>((set) => ({
  selectedId: null,
  peekOpen: false,
  selectRelevamiento: (id) => set({ selectedId: id, peekOpen: true }),
  closePeek: () => set({ peekOpen: false, selectedId: null }),

  filtros: { ...filtrosDefault },
  setFiltro: (key, value) => set((state) => ({
    filtros: { ...state.filtros, [key]: value, ...(key !== 'pagina' ? { pagina: 1 } : {}) }
  })),
  resetFiltros: () => set({ filtros: { ...filtrosDefault } }),

  mobileView: 'list',
  setMobileView: (view) => set({ mobileView: view }),

  hoveredId: null,
  setHoveredId: (id) => set({ hoveredId: id }),
}));
