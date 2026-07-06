import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import {
  ExecutorFormFields,
  type ExecutorFormValues,
} from '../../components/executor/ExecutorFormFields';
import { createExecutor } from '../../repositories/executorRepository';

const INITIAL_VALUES: ExecutorFormValues = {
  name: '',
  phone: '',
  email: '',
  note: '',
};

export default function CreateExecutorScreen() {
  const [values, setValues] = useState<ExecutorFormValues>(INITIAL_VALUES);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!values.name.trim()) {
      setErrorMessage('Укажите имя исполнителя');
      return;
    }

    setSaving(true);
    try {
      const executor = await createExecutor({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        note: values.note.trim(),
      });

      router.replace(`/executor/${executor.id}`);
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось создать исполнителя');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="Новый исполнитель">
      <ExecutorFormFields values={values} onChange={setValues} />

      <View style={styles.actions}>
        <Button mode="contained" loading={saving} onPress={handleSave}>
          Сохранить
        </Button>
      </View>

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
  actions: {
    marginTop: 8,
  },
});
