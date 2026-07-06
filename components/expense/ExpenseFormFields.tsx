import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { DateField } from '../common/DateField';
import { ProjectPicker } from '../common/ProjectPicker';
import { useSettings } from '../../contexts/SettingsContext';
import type { Project } from '../../types/entities';

export type ExpenseFormValues = {
  projectId: number | null;
  amount: string;
  description: string;
  date: Date;
};

type ExpenseFormFieldsProps = {
  projects: Project[];
  values: ExpenseFormValues;
  onChange: (values: ExpenseFormValues) => void;
};

export function ExpenseFormFields({
  projects,
  values,
  onChange,
}: ExpenseFormFieldsProps) {
  const { settings } = useSettings();
  const update = (patch: Partial<ExpenseFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View>
      <ProjectPicker
        label="Проект"
        projects={projects}
        value={values.projectId}
        onChange={(projectId) => update({ projectId })}
      />

      <TextInput
        label={`Сумма, ${settings.currencySymbol}`}
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
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
});
