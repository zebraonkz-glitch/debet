import 'react-native-gesture-handler';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, Portal } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getDatabase } from '../db';
import { SettingsProvider } from '../contexts/SettingsContext';
import { theme } from '../theme';

export default function RootLayout() {
  useEffect(() => {
    getDatabase().catch((error) => {
      console.error('Ошибка инициализации базы данных:', error);
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SettingsProvider>
          <PaperProvider
            theme={theme}
            settings={{
              icon: (props) => <MaterialCommunityIcons {...props} />,
            }}
          >
            <Portal.Host>
              <Stack screenOptions={{ headerShown: false }} />
            </Portal.Host>
          </PaperProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
