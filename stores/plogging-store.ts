import { create } from 'zustand';

interface PloggingState {
  isNavigating: boolean;
  completionPercentage: number;
  routeInfo: { distance: number; duration: number } | null;
  routeName: string;
  gradeLocations: Array<{ grade: 1 | 2 | 3 }>;
  
  setIsNavigating: (isNavigating: boolean) => void;
  setCompletionPercentage: (percentage: number) => void;
  setRouteInfo: (info: { distance: number; duration: number } | null) => void;
  setRouteName: (name: string) => void;
  setGradeLocations: (locations: Array<{ grade: 1 | 2 | 3 }>) => void;
  reset: () => void;
}

export const usePloggingStore = create<PloggingState>((set) => ({
  isNavigating: false,
  completionPercentage: 0,
  routeInfo: null,
  routeName: '광안리 해수욕장 코스',
  gradeLocations: [],
  
  setIsNavigating: (isNavigating) => set({ isNavigating }),
  setCompletionPercentage: (percentage) => set({ completionPercentage: percentage }),
  setRouteInfo: (info) => set({ routeInfo: info }),
  setRouteName: (name) => set({ routeName: name }),
  setGradeLocations: (locations) => set({ gradeLocations: locations }),
  reset: () => set({
    isNavigating: false,
    completionPercentage: 0,
    routeInfo: null,
    routeName: '광안리 해수욕장 코스',
    gradeLocations: [],
  }),
}));
