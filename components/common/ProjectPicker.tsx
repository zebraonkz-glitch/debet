import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Menu, Text } from 'react-native-paper';

import type { Project } from '../../types/entities';

type ProjectPickerProps = {
  label: string;
  projects: Project[];
  value: number | null;
  onChange: (projectId: number) => void;
};

export function ProjectPicker({
  label,
  projects,
  value,
  onChange,
}: ProjectPickerProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const selectedProject = projects.find((project) => project.id === value);

  return (
    <View style={styles.block}>
      <Text variant="titleMedium" style={styles.label}>
        {label}
      </Text>
      {projects.length === 0 ? (
        <Text variant="bodyMedium" style={styles.hint}>
          Сначала создайте проект
        </Text>
      ) : (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              icon="menu-down"
              onPress={() => setMenuVisible(true)}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {selectedProject?.name ?? 'Выберите проект'}
            </Button>
          }
        >
          {projects.map((project) => (
            <Menu.Item
              key={project.id}
              title={project.name}
              onPress={() => {
                onChange(project.id);
                setMenuVisible(false);
              }}
            />
          ))}
        </Menu>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 16,
  },
  label: {
    color: '#1a1a2e',
    marginBottom: 8,
  },
  hint: {
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#ffffff',
  },
  buttonContent: {
    justifyContent: 'flex-start',
  },
});
