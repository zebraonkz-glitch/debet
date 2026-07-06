import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider, Portal } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getDatabase } from '../db';
import { theme } from '../theme';

export default function RootLayout() {
  useEffect(() => {
    void getDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Portal.Host>
          <Stack screenOptions={{ headerShown: false }} />
        </Portal.Host>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
