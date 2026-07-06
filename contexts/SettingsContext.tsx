import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getSettings,
  loadSettings,
  saveCurrencySymbol,
  subscribeSettings,
  type AppSettings,
} from '../utils/settings';

type SettingsContextValue = {
  settings: AppSettings;
  loading: boolean;
  setCurrencySymbol: (symbol: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const loaded = await loadSettings();
    setSettings(loaded);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const loaded = await loadSettings();
      if (active) {
        setSettings(loaded);
        setLoading(false);
      }
    })();

    const unsubscribe = subscribeSettings(() => {
      if (active) {
        setSettings(getSettings());
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const setCurrencySymbol = useCallback(async (symbol: string) => {
    const saved = await saveCurrencySymbol(symbol);
    setSettings(saved);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      setCurrencySymbol,
      refresh,
    }),
    [loading, refresh, setCurrencySymbol, settings],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings должен использоваться внутри SettingsProvider');
  }

  return context;
}
