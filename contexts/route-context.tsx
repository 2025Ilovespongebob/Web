import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RouteInfo {
  distance: number;
  duration: number;
}

interface RouteContextType {
  routeInfo: RouteInfo | null;
  setRouteInfo: (info: RouteInfo | null) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  return (
    <RouteContext.Provider value={{ routeInfo, setRouteInfo }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}
