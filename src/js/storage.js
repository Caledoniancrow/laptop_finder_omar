const FAVORITES_KEY = "laptop-finder:favorites";
const COMPARE_KEY = "laptop-finder:compare";
const THEME_KEY = "laptop-finder:theme";

export const MAX_COMPARE = 4;

const readSaved = (key, fallback) => {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return fallback;
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    return fallback;
  }
};

const writeSaved = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFavoriteIds = () => readSaved(FAVORITES_KEY, []);

export const isFavorite = (laptopId) => getFavoriteIds().includes(laptopId);

export const getCompareIds = () => readSaved(COMPARE_KEY, []);

export const saveCompareIds = (laptopIds) => {
  writeSaved(COMPARE_KEY, laptopIds);
};

export const addFavorite = (laptopId) => {
  if (isFavorite(laptopId)) {
    return;
  }
  writeSaved(FAVORITES_KEY, [...getFavoriteIds(), laptopId]);
  const compareIds = getCompareIds();
  if (compareIds.length < MAX_COMPARE && !compareIds.includes(laptopId)) {
    saveCompareIds([...compareIds, laptopId]);
  }
};

export const removeFavorite = (laptopId) => {
  writeSaved(FAVORITES_KEY, getFavoriteIds().filter((favoriteId) => favoriteId !== laptopId));
  saveCompareIds(getCompareIds().filter((compareId) => compareId !== laptopId));
};

export const toggleFavorite = (laptopId) => {
  if (isFavorite(laptopId)) {
    removeFavorite(laptopId);
    return false;
  }
  addFavorite(laptopId);
  return true;
};

export const clearFavorites = () => {
  localStorage.removeItem(FAVORITES_KEY);
  localStorage.removeItem(COMPARE_KEY);
};

export const getTheme = () => readSaved(THEME_KEY, "saver");

export const saveTheme = (theme) => {
  writeSaved(THEME_KEY, theme);
};
