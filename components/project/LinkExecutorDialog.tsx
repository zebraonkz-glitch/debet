import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, SegmentedButtons, Text } from 'react-native-paper';

import { ExecutorFormFields, type ExecutorFormValues } from '../executor/ExecutorFormFields';
import { getAllExecutors } from '../../repositories/executorRepository';
import type { Executor } from '../../types/entities';

type LinkExecutorDialogProps = {
  visible: boolean;
  linkedExecutorIds: number[];
  onDismiss: () => void;
  onLinkExisting: (executorId: number) => Promise<void>;
  onCreateAndLink: (values: ExecutorFormValues) => Promise<void>;
};

export function LinkExecutorDialog({
  visible,
  linkedExecutorIds,
  onDismiss,
  onLinkExisting,
  onCreateAndLink,
}: LinkExecutorDialogProps) {
  const [mode, setMode] = useState<'existing' | 'create'>('existing');
  const [executors, setExecutors] = useState<Executor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<ExecutorFormValues>({
    name: '',
    phone: '',
    email: '',
    note: '',
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    setMode('existing');
    setValues({ name: '', phone: '', email: '', note: '' });
    setLoading(true);

    getAllExecutors()
      .then(setExecutors)
      .finally(() => setLoading(false));
  }, [visible]);

  const availableExecutors = executors.filter(
    (executor) => !linkedExecutorIds.includes(executor.id),
  );

  const handleDismiss = () => {
    onDismiss();
  };

  const handleLink = async (executorId: number) => {
    setSaving(true);
    try {
      await onLinkExisting(executorId);
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!values.name.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onCreateAndLink({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        note: values.note.trim(),
      });
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>Привязать исполнителя</Dialog.Title>
        <Dialog.Content>
          <SegmentedButtons
            value={mode}
            onValueChange={(value) => setMode(value as 'existing' | 'create')}
            buttons={[
              { value: 'existing', label: 'Выбрать' },
              { value: 'create', label: 'Создать' },
            ]}
            style={styles.segmented}
          />

          {mode === 'existing' ? (
            <View>
              {loading ? (
                <Text variant="bodyMedium" style={styles.hint}>
                  Загрузка...
                </Text>
              ) : availableExecutors.length === 0 ? (
                <Text variant="bodyMedium" style={styles.hint}>
                  Нет доступных исполнителей. Создайте нового.
                </Text>
              ) : (
                <ScrollView style={styles.list}>
                  {availableExecutors.map((executor) => (
                    <Button
                      key={executor.id}
                      mode="outlined"
                      onPress={() => handleLink(executor.id)}
                      disabled={saving}
                      style={styles.executorButton}
                    >
                      {executor.name}
                    </Button>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <ExecutorFormFields values={values} onChange={setValues} />
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Отмена</Button>
          {mode === 'create' ? (
            <Button loading={saving} onPress={handleCreate}>
              Создать и привязать
            </Button>
          ) : null}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  segmented: {
    marginBottom: 12,
  },
  hint: {
    color: '#6b7280',
  },
  list: {
    maxHeight: 240,
  },
  executorButton: {
    marginBottom: 8,
  },
});
