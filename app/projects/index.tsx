import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, FAB, Text } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import { ProjectListCard } from '../../components/project/ProjectListCard';
import { getAllProjects, getProjectsByFlags } from '../../repositories/projectRepository';
import type { Project } from '../../types/entities';

type ProjectFilter = 'all' | 'finished' | 'liked';

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'finished', label: 'Закончен' },
  { id: 'liked', label: 'Понравилось' },
];

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        filter === 'all'
          ? await getAllProjects()
          : await getProjectsByFlags({
              finished: filter === 'finished' ? true : undefined,
              liked: filter === 'liked' ? true : undefined,
            });
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      void loadProjects();
    }, [loadProjects]),
  );

  return (
    <ScreenLayout title="Проекты" scrollable={false}>
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

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : projects.length === 0 ? (
        <Text variant="bodyLarge" style={styles.empty}>
          Проекты не найдены
        </Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProjectListCard project={item} />}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/project/create')}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    backgroundColor: '#ffffff',
  },
  list: {
    paddingBottom: 88,
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1a5fb4',
  },
});
