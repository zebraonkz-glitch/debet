import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type MenuButton = {
  id: string;
  title: string;
  subtitle: string;
};

const MENU_BUTTONS: MenuButton[] = [
  { id: 'create-project', title: 'Создать проект', subtitle: 'Новый проект учёта' },
  { id: 'create-expense', title: 'Создать расход', subtitle: 'Добавить расход' },
  { id: 'projects', title: 'Проекты', subtitle: 'Список проектов' },
  { id: 'reports', title: 'Отчёты', subtitle: 'Сводка по проектам' },
  { id: 'settings', title: 'Настройки', subtitle: 'Параметры приложения' },
];

export default function App() {
  const handlePress = (button: MenuButton) => {
    Alert.alert(button.title, 'Раздел в разработке');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Debet</Text>
          <Text style={styles.subtitle}>Учёт доходов и расходов</Text>
        </View>

        <View style={styles.buttons}>
          {MENU_BUTTONS.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => handlePress(button)}
            >
              <Text style={styles.buttonTitle}>{button.title}</Text>
              <Text style={styles.buttonSubtitle}>{button.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#5c6370',
  },
  buttons: {
    gap: 12,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e3e7ee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});
