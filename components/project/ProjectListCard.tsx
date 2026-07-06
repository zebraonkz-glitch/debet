import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import type { Project } from '../../types/entities';
import { formatDateOnly, formatMoney } from '../../utils/format';

type ProjectListCardProps = {
  project: Project;
};

export function ProjectListCard({ project }: ProjectListCardProps) {
  return (
    <Pressable onPress={() => router.push(`/project/${project.id}`)}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            {project.name}
          </Text>
          {project.description ? (
            <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
              {project.description}
            </Text>
          ) : null}
          <Text variant="bodySmall" style={styles.date}>
            {formatDateOnly(project.date)} · {formatMoney(project.amount)}
          </Text>
          <View style={styles.chips}>
            {project.finished ? (
              <Chip compact style={styles.chip}>
                Закончен
              </Chip>
            ) : null}
            {project.liked ? (
              <Chip compact style={styles.chip} icon="heart">
                Понравилось
              </Chip>
            ) : null}
            {project.dd ? (
              <Chip compact style={styles.chip} icon="map-marker">
                Есть координаты
              </Chip>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#1a1a2e',
    marginBottom: 4,
  },
  description: {
    color: '#5c6370',
    marginBottom: 8,
  },
  date: {
    color: '#9aa0a6',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#eef2f7',
  },
});
