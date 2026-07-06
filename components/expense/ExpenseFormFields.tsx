import { StyleSheet, View } from 'react-native';
import { Chip, Text, TextInput } from 'react-native-paper';

import { DateField } from '../common/DateField';
import type { BudgetItem, Project } from '../../types/entities';

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
};

export function ExpenseFormFields({
  projects,
  budgetItems,
  values,
  onChange,
  showProjectPicker = true,
}: ExpenseFormFieldsProps) {
  const update = (patch: Partial<ExpenseFormValues>) => {
    onChange({ ...values, ...patch });
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

      <DateField
        label="Дата"
        value={values.date}
        mode="datetime"
        onChange={(date) => update({ date })}
      />
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
});
