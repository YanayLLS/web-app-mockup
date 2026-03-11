import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface FavoriteItem {
  id: string;
  name: string;
  customName?: string; // User-defined shortcut name
  icon?: string;
  projectId: string;
  type: 'article' | 'video' | 'document' | 'procedure' | 'media';
  mediaType?: 'image' | 'video' | 'document';
  thumbnail?: string;
  url?: string;
  description?: string;
  connectedDigitalTwinIds?: string[];
  isPublished?: boolean;
  hasUnpublishedChanges?: boolean;
  publishedVersion?: string;
  publishedDate?: string;
  createdBy?: string;
  createdDate?: string;
  lastEditedBy?: string;
  lastEdited?: string;
  data?: any; // Store the full item data for modal display
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  renameFavorite: (id: string, customName: string) => void;
  isFavorite: (id: string) => boolean;
  getFavoritesByProject: (projectId: string) => FavoriteItem[];
}

// Create default context value for safety
const defaultContextValue: FavoritesContextType = {
  favorites: [],
  addFavorite: () => console.warn('FavoritesProvider not found'),
  removeFavorite: () => console.warn('FavoritesProvider not found'),
  renameFavorite: () => console.warn('FavoritesProvider not found'),
  isFavorite: () => false,
  getFavoritesByProject: () => [],
};

const FavoritesContext = createContext<FavoritesContextType>(defaultContextValue);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    // Load favorites from localStorage on init
    const saved = localStorage.getItem('frontline-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('frontline-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      // Prevent duplicates
      if (prev.some((fav) => fav.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  const renameFavorite = (id: string, customName: string) => {
    setFavorites((prev) =>
      prev.map((fav) => (fav.id === id ? { ...fav, customName: customName.trim() || undefined } : fav))
    );
  };

  const isFavorite = (id: string) => {
    return favorites.some((fav) => fav.id === id);
  };

  const getFavoritesByProject = (projectId: string) => {
    return favorites.filter((fav) => fav.projectId === projectId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        renameFavorite,
        isFavorite,
        getFavoritesByProject,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  return context;
}
