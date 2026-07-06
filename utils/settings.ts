import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@debet/settings';
export const DEFAULT_CURRENCY_SYMBOL = '₽';

export type AppSettings = {
  currencySymbol: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: DEFAULT_CURRENCY_SYMBOL,
};

let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function getCurrencySymbol(): string {
  return currentSettings.currencySymbol;
}

export function getSettings(): AppSettings {
  return { ...currentSettings };
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      currentSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        currencySymbol:
          parsed.currencySymbol?.trim() || DEFAULT_CURRENCY_SYMBOL,
      };
    }
  } catch (error) {
    console.error('Не удалось загрузить настройки:', error);
    currentSettings = { ...DEFAULT_SETTINGS };
  }

  notifyListeners();
  return getSettings();
}

export async function saveCurrencySymbol(symbol: string): Promise<AppSettings> {
  const currencySymbol = symbol.trim() || DEFAULT_CURRENCY_SYMBOL;
  currentSettings = { ...currentSettings, currencySymbol };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  notifyListeners();

  return getSettings();
}
