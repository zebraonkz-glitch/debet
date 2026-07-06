import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

type ExecutorDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (values: {
    name: string;
    phone: string;
    email: string;
    note: string;
  }) => Promise<void>;
};

export function ExecutorDialog({
  visible,
  onDismiss,
  onSubmit,
}: ExecutorDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setNote('');
  };

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        note: note.trim(),
      });
      reset();
      onDismiss();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>Добавить исполнителя</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Имя"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Телефон"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Заметка"
            value={note}
            onChangeText={setNote}
            mode="outlined"
            multiline
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
