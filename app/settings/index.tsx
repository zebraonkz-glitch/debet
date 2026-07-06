import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import { useSettings } from '../../contexts/SettingsContext';
import { clearAllData } from '../../db/clearAllData';
import {
  getAppPermissions,
  getPermissionStatusLabel,
  requestCameraPermission,
  requestLocationPermission,
  requestMediaLibraryPermission,
  type AppPermissions,
} from '../../utils/permissions';
import { formatMoney } from '../../utils/format';

const CURRENCY_PRESETS = ['₽', '$', '€', '¥', '₸'];

function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

export default function SettingsScreen() {
  const { settings, setCurrencySymbol } = useSettings();
  const [currencyInput, setCurrencyInput] = useState(settings.currencySymbol);
  const [permissions, setPermissions] = useState<AppPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    setPermissionsLoading(true);
    try {
      const data = await getAppPermissions();
      setPermissions(data);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrencyInput(settings.currencySymbol);
      void loadPermissions();
    }, [loadPermissions, settings.currencySymbol]),
  );

  const handleSaveCurrency = async () => {
    setSavingCurrency(true);
    try {
      await setCurrencySymbol(currencyInput);
      setMessage('Символ валюты сохранён');
    } catch (error) {
      console.error(error);
      setMessage('Не удалось сохранить настройку');
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleOpenSystemSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error(error);
      setMessage('Не удалось открыть системные настройки');
    }
  };

  const handleRequestPermission = async (
    type: 'camera' | 'mediaLibrary' | 'location',
  ) => {
    try {
      if (type === 'camera') {
        await requestCameraPermission();
      } else if (type === 'mediaLibrary') {
        await requestMediaLibraryPermission();
      } else {
        await requestLocationPermission();
      }

      await loadPermissions();
    } catch (error) {
      console.error(error);
      setMessage('Не удалось запросить разрешение');
    }
  };

  const confirmClearData = () => {
    Alert.alert(
      'Удалить все данные?',
      'Будут удалены все проекты, расходы, исполнители и фотографии. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            void handleClearData();
          },
        },
      ],
    );
  };

  const handleClearData = async () => {
    setClearing(true);
    try {
      await clearAllData();
      setMessage('Все данные удалены');
    } catch (error) {
      console.error(error);
      setMessage('Не удалось удалить данные');
    } finally {
      setClearing(false);
    }
  };

  return (
    <ScreenLayout title="Настройки">
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            О приложении
          </Text>
          <Text variant="bodyMedium">Debet</Text>
          <Text variant="bodySmall" style={styles.muted}>
            Версия {getAppVersion()}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Платформа: {Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Валюта
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Символ для отображения сумм: {formatMoney(12500, currencyInput)}
          </Text>
          <TextInput
            label="Символ валюты"
            value={currencyInput}
            onChangeText={setCurrencyInput}
            mode="outlined"
            maxLength={4}
            style={styles.input}
          />
          <View style={styles.chips}>
            {CURRENCY_PRESETS.map((symbol) => (
              <Chip
                key={symbol}
                selected={currencyInput === symbol}
                onPress={() => setCurrencyInput(symbol)}
                style={styles.chip}
              >
                {symbol}
              </Chip>
            ))}
          </View>
          <Button
            mode="contained"
            loading={savingCurrency}
            onPress={() => {
              void handleSaveCurrency();
            }}
            style={styles.actionButton}
          >
            Сохранить валюту
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Разрешения
          </Text>
          {permissionsLoading || !permissions ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <View style={styles.permissionList}>
              <PermissionRow
                title="Камера"
                status={permissions.camera}
                onRequest={() => {
                  void handleRequestPermission('camera');
                }}
              />
              <PermissionRow
                title="Галерея"
                status={permissions.mediaLibrary}
                onRequest={() => {
                  void handleRequestPermission('mediaLibrary');
                }}
              />
              <PermissionRow
                title="Геолокация"
                status={permissions.location}
                onRequest={() => {
                  void handleRequestPermission('location');
                }}
              />
            </View>
          )}
          <Button mode="outlined" onPress={() => void handleOpenSystemSettings()}>
            Открыть настройки системы
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Данные
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Удаляет все проекты, расходы, исполнителей и фотографии с
            устройства.
          </Text>
          <Button
            mode="outlined"
            buttonColor="#ffebee"
            textColor="#c62828"
            loading={clearing}
            onPress={confirmClearData}
            style={styles.actionButton}
          >
            Очистить все данные
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.links}>
        <Button
          mode="outlined"
          icon="account-group"
          onPress={() => router.push('/executors')}
        >
          Все исполнители
        </Button>
      </View>

      <Snackbar
        visible={Boolean(message)}
        onDismiss={() => setMessage(null)}
        duration={3000}
      >
        {message}
      </Snackbar>
    </ScreenLayout>
  );
}

type PermissionRowProps = {
  title: string;
  status: AppPermissions[keyof AppPermissions];
  onRequest: () => void;
};

function PermissionRow({ title, status, onRequest }: PermissionRowProps) {
  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionInfo}>
        <Text variant="bodyMedium">{title}</Text>
        <Text variant="bodySmall" style={styles.muted}>
          {getPermissionStatusLabel(status)}
        </Text>
      </View>
      <Button mode="text" compact onPress={onRequest}>
        Запросить
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  muted: {
    color: '#6b7280',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#eef2f7',
  },
  actionButton: {
    marginTop: 4,
  },
  loader: {
    marginVertical: 12,
  },
  permissionList: {
    marginBottom: 12,
    gap: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
    marginRight: 8,
  },
  links: {
    gap: 12,
  },
});
