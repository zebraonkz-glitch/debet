import { StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';

import { DateField } from '../common/DateField';
import type { Coordinates } from '../../types/entities';
import { formatCoordinates } from '../../utils/format';

export type ProjectFormValues = {
  name: string;
  description: string;
  date: Date;
  amount: string;
  finished: boolean;
  liked: boolean;
  dd: Coordinates | null;
};

type ProjectFormFieldsProps = {
  values: ProjectFormValues;
  onChange: (values: ProjectFormValues) => void;
  onRequestLocation: () => void;
  locationLoading?: boolean;
};

export function ProjectFormFields({
  values,
  onChange,
  onRequestLocation,
  locationLoading = false,
}: ProjectFormFieldsProps) {
  const update = (patch: Partial<ProjectFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View>
      <TextInput
        label="Название проекта"
        value={values.name}
        onChangeText={(name) => update({ name })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Описание"
        value={values.description}
        onChangeText={(description) => update({ description })}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <DateField
        label="Дата проекта"
        value={values.date}
        mode="date"
        onChange={(date) => update({ date })}
      />

      <TextInput
        label="Сумма, ₽"
        value={values.amount}
        onChangeText={(amount) => update({ amount })}
        mode="outlined"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Закончен</Text>
        <Switch
          value={values.finished}
          onValueChange={(finished) => update({ finished })}
        />
      </View>

      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Понравилось</Text>
        <Switch
          value={values.liked}
          onValueChange={(liked) => update({ liked })}
        />
      </View>

      <View style={styles.locationBlock}>
        <Text variant="titleMedium" style={styles.locationTitle}>
          Координаты (GPS)
        </Text>
        {values.dd ? (
          <Text variant="bodyMedium" style={styles.coords}>
            {formatCoordinates(values.dd.latitude, values.dd.longitude)}
          </Text>
        ) : (
          <Text variant="bodyMedium" style={styles.coordsEmpty}>
            Координаты не заданы
          </Text>
        )}
        <View style={styles.locationActions}>
          <Button
            mode="outlined"
            icon="crosshairs-gps"
            loading={locationLoading}
            onPress={onRequestLocation}
          >
            Получить координаты
          </Button>
          {values.dd ? (
            <Button mode="text" onPress={() => update({ dd: null })}>
              Очистить
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  block: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  locationBlock: {
    marginBottom: 20,
  },
  locationTitle: {
    marginBottom: 4,
    color: '#1a1a2e',
  },
  coords: {
    color: '#1a5fb4',
    marginBottom: 8,
  },
  coordsEmpty: {
    color: '#6b7280',
    marginBottom: 8,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});
