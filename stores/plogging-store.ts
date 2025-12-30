import { create } from 'zustand';

interface RouteData {
  segment_id: number;
  type: string;
  destination_name: string;
  trash_grade: number;
  path: Array<{ x: number; y: number }>;
  scrapedImages: string[];
}

interface PloggingState {
  isNavigating: boolean;
  completionPercentage: number;
  routeInfo: { distance: number; duration: number } | null;
  routeName: string;
  gradeLocations: Array<{ grade: 1 | 2 | 3 }>;
  generatedRoutes: RouteData[]; // 생성된 경로 데이터 저장
  
  setIsNavigating: (isNavigating: boolean) => void;
  setCompletionPercentage: (percentage: number) => void;
  setRouteInfo: (info: { distance: number; duration: number } | null) => void;
  setRouteName: (name: string) => void;
  setGradeLocations: (locations: Array<{ grade: 1 | 2 | 3 }>) => void;
  setGeneratedRoutes: (routes: RouteData[]) => void;
  reset: () => void;
}

export const usePloggingStore = create<PloggingState>((set) => ({
  isNavigating: false,
  completionPercentage: 0,
  routeInfo: null,
  routeName: '광안리 해수욕장 코스',
  gradeLocations: [],
  generatedRoutes: [],
  
  setIsNavigating: (isNavigating) => set({ isNavigating }),
  setCompletionPercentage: (percentage) => set({ completionPercentage: percentage }),
  setRouteInfo: (info) => set({ routeInfo: info }),
  setRouteName: (name) => set({ routeName: name }),
  setGradeLocations: (locations) => set({ gradeLocations: locations }),
  setGeneratedRoutes: (routes) => set({ generatedRoutes: routes }),
  reset: () => set({
    isNavigating: false,
    completionPercentage: 0,
    routeInfo: null,
    routeName: '광안리 해수욕장 코스',
    gradeLocations: [],
    generatedRoutes: [],
  }),
}));
