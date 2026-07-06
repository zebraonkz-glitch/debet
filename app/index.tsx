import { Href, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MenuItem = {
  title: string;
  subtitle: string;
  href: Href;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Создать проект',
    subtitle: 'Новый проект учёта',
    href: '/project/create',
  },
  {
    title: 'Создать расход',
    subtitle: 'Добавить расход',
    href: '/expense/create',
  },
  {
    title: 'Журнал',
    subtitle: 'Список проектов по дате',
    href: '/projects',
  },
  {
    title: 'Отчёты',
    subtitle: 'Сводка по проектам',
    href: '/reports',
  },
  {
    title: 'Настройки',
    subtitle: 'Параметры приложения',
    href: '/settings',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Debet
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Учёт доходов и расходов
        </Text>
      </View>

      <View style={styles.buttons}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.href as string}
            onPress={() => router.push(item.href)}
          >
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {item.title}
                </Text>
                <Text variant="bodyMedium" style={styles.cardSubtitle}>
                  {item.subtitle}
                </Text>
              </Card.Content>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  subtitle: {
    color: '#5c6370',
  },
  buttons: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#1a1a2e',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#6b7280',
  },
});
