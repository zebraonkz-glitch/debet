import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  FAB,
  Snackbar,
  Text,
} from 'react-native-paper';

import { DateField } from '../../components/common/DateField';
import { ScreenLayout } from '../../components/ScreenLayout';
import { ProjectListCard } from '../../components/project/ProjectListCard';
import { getAllProjects } from '../../repositories/projectRepository';
import type { Project } from '../../types/entities';
import {
  filterProjectsByFlags,
  isProjectDateInPeriod,
  sortProjectsByDate,
} from '../../utils/projects';

type ProjectFilter = 'all' | 'finished' | 'liked';

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'finished', label: 'Закончен' },
  { id: 'liked', label: 'Понравилось' },
];

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleProjects = useMemo(() => {
    const flagged =
      filter === 'all'
        ? projects
        : filterProjectsByFlags(projects, {
            finished: filter === 'finished' ? true : undefined,
            liked: filter === 'liked' ? true : undefined,
          });

    const inPeriod = flagged.filter((project) =>
      isProjectDateInPeriod(project, fromDate, toDate),
    );

    return sortProjectsByDate(inPeriod);
  }, [filter, fromDate, projects, toDate]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProjects();
    }, [loadProjects]),
  );

  const handlePeriodChange = (nextFrom: Date | null, nextTo: Date | null) => {
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setErrorMessage('Дата начала не может быть позже даты окончания');
      return;
    }

    setFromDate(nextFrom);
    setToDate(nextTo);
  };

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.filters}>
        {FILTERS.map((item) => (
          <Chip
            key={item.id}
            selected={filter === item.id}
            onPress={() => setFilter(item.id)}
            style={styles.chip}
          >
            {item.label}
          </Chip>
        ))}
      </View>

      <Text variant="titleSmall" style={styles.periodTitle}>
        Период отображения
      </Text>
      <Text variant="bodySmall" style={styles.hint}>
        Оставьте пустым, чтобы показать все даты
      </Text>

      <DateField
        label="С даты"
        value={fromDate ?? new Date()}
        mode="date"
        onChange={(date) => handlePeriodChange(date, toDate)}
      />
      {fromDate ? (
        <Button
          mode="text"
          compact
          onPress={() => handlePeriodChange(null, toDate)}
        >
          Очистить начало периода
        </Button>
      ) : null}

      <DateField
        label="По дату"
        value={toDate ?? new Date()}
        mode="date"
        onChange={(date) => handlePeriodChange(fromDate, date)}
      />
      {toDate ? (
        <Button
          mode="text"
          compact
          onPress={() => handlePeriodChange(fromDate, null)}
        >
          Очистить конец периода
        </Button>
      ) : null}
    </View>
  );

  return (
    <ScreenLayout title="Журнал" scrollable={false}>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : visibleProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          {listHeader}
          <Text variant="bodyLarge" style={styles.empty}>
            Проекты не найдены
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleProjects}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProjectListCard project={item} />}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/project/create')}
      />

      <Snackbar
        visible={Boolean(errorMessage)}
        onDismiss={() => setErrorMessage(null)}
        duration={3000}
      >
        {errorMessage}
      </Snackbar>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#ffffff',
  },
  periodTitle: {
    color: '#1a1a2e',
    marginBottom: 4,
  },
  hint: {
    color: '#6b7280',
    marginBottom: 8,
  },
  list: {
    paddingBottom: 88,
  },
  loader: {
    marginTop: 24,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    color: '#6b7280',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1a5fb4',
  },
});
