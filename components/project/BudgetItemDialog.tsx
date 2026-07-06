import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

import { useSettings } from '../../contexts/SettingsContext';
import type { BudgetItem } from '../../types/entities';

export type BudgetItemFormValues = {
  name: string;
  plannedAmount: number;
  order: number;
};

type BudgetItemDialogProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  item?: BudgetItem | null;
  suggestedOrder?: number;
  onDismiss: () => void;
  onSubmit: (values: BudgetItemFormValues) => Promise<void>;
};

export function BudgetItemDialog({
  visible,
  mode,
  item,
  suggestedOrder = 0,
  onDismiss,
  onSubmit,
}: BudgetItemDialogProps) {
  const { settings } = useSettings();
  const [name, setName] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [order, setOrder] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (mode === 'edit' && item) {
      setName(item.name);
      setPlannedAmount(String(item.plannedAmount));
      setOrder(String(item.order));
      return;
    }

    setName('');
    setPlannedAmount('');
    setOrder(String(suggestedOrder));
  }, [visible, mode, item, suggestedOrder]);

  const handleDismiss = () => {
    onDismiss();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const amount = Number(plannedAmount.replace(',', '.'));
    const sortOrder = Number(order);

    if (!trimmedName || !Number.isFinite(amount) || amount < 0) {
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: trimmedName,
        plannedAmount: amount,
        order: sortOrder,
      });
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>
          {mode === 'create' ? 'Добавить пункт бюджета' : 'Редактировать пункт'}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Название"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={`Плановая сумма, ${settings.currencySymbol}`}
            value={plannedAmount}
            onChangeText={setPlannedAmount}
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <TextInput
            label="Порядок"
            value={order}
            onChangeText={setOrder}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Отмена</Button>
          <Button loading={saving} onPress={handleSave}>
            Сохранить
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
});
