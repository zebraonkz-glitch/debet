import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Chip, Text, TextInput } from 'react-native-paper';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import type { BudgetItem, Project } from '../../types/entities';
import { formatDate } from '../../utils/format';

export type ExpenseFormValues = {
  projectId: number | null;
  budgetItemId: number | null;
  amount: string;
  description: string;
  date: Date;
};

type ExpenseFormFieldsProps = {
  projects: Project[];
  budgetItems: BudgetItem[];
  values: ExpenseFormValues;
  onChange: (values: ExpenseFormValues) => void;
  showProjectPicker?: boolean;
  showDatePicker: boolean;
  onToggleDatePicker: (visible: boolean) => void;
};

export function ExpenseFormFields({
  projects,
  budgetItems,
  values,
  onChange,
  showProjectPicker = true,
  showDatePicker,
  onToggleDatePicker,
}: ExpenseFormFieldsProps) {
  const update = (patch: Partial<ExpenseFormValues>) => {
    onChange({ ...values, ...patch });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      onToggleDatePicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    update({ date: selectedDate });
  };

  return (
    <View>
      {showProjectPicker ? (
        <View style={styles.block}>
          <Text variant="titleMedium" style={styles.label}>
            Проект
          </Text>
          {projects.length === 0 ? (
            <Text variant="bodyMedium" style={styles.hint}>
              Сначала создайте проект
            </Text>
          ) : (
            <View style={styles.chips}>
              {projects.map((project) => (
                <Chip
                  key={project.id}
                  selected={values.projectId === project.id}
                  onPress={() =>
                    update({
                      projectId: project.id,
                      budgetItemId: null,
                    })
                  }
                  style={styles.chip}
                >
                  {project.name}
                </Chip>
              ))}
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.block}>
        <Text variant="titleMedium" style={styles.label}>
          Пункт бюджета
        </Text>
        {!values.projectId ? (
          <Text variant="bodyMedium" style={styles.hint}>
            Выберите проект
          </Text>
        ) : budgetItems.length === 0 ? (
          <Text variant="bodyMedium" style={styles.hint}>
            В проекте нет пунктов бюджета
          </Text>
        ) : (
          <View style={styles.chips}>
            {budgetItems.map((item) => (
              <Chip
                key={item.id}
                selected={values.budgetItemId === item.id}
                onPress={() => update({ budgetItemId: item.id })}
                style={styles.chip}
              >
                {item.name}
              </Chip>
            ))}
          </View>
        )}
      </View>

      <TextInput
        label="Сумма, ₽"
        value={values.amount}
        onChangeText={(amount) => update({ amount })}
        mode="outlined"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <TextInput
        label="Описание"
        value={values.description}
        onChangeText={(description) => update({ description })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <View style={styles.block}>
        <Text variant="titleMedium" style={styles.label}>
          Дата
        </Text>
        <Pressable onPress={() => onToggleDatePicker(true)}>
          <Text variant="bodyLarge" style={styles.dateValue}>
            {formatDate(values.date.toISOString())}
          </Text>
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={values.date}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        ) : null}
      </View>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#ffffff',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  dateValue: {
    color: '#1a5fb4',
  },
});
