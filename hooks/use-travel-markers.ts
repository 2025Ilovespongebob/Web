import { useState } from 'react';
import { travelMarkers as initialMarkers, type TravelMarker } from '../types/travel';

export const useTravelMarkers = () => {
  const [markers, setMarkers] = useState<TravelMarker[]>(initialMarkers);
  const [route, setRoute] = useState<number[]>([1, 2, 3, 4]);
  const [isAddingMode, setIsAddingMode] = useState(false);

  const addMarker = (name: string, lat: number, lng: number, category: 1 | 2 | 3, day: number) => {
    const newId = Math.max(...markers.map(m => m.id)) + 1;
    const newMarker: TravelMarker = {
      id: newId,
      name,
      lat,
      lng,
      category,
      day
    };
    
    setMarkers(prev => [...prev, newMarker]);
    setRoute(prev => [...prev, newId]);
    
    return newMarker;
  };

  const removeMarker = (id: number) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
    setRoute(prev => prev.filter(markerId => markerId !== id));
  };

  const reorderRoute = (newRoute: number[]) => {
    setRoute(newRoute);
  };

  const toggleAddingMode = () => {
    setIsAddingMode(prev => !prev);
  };

  return {
    markers,
    route,
    isAddingMode,
    addMarker,
    removeMarker,
    reorderRoute,
    toggleAddingMode
  };
};
