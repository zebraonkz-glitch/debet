import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

export type ExecutorFormValues = {
  name: string;
  phone: string;
  email: string;
  note: string;
};

type ExecutorFormFieldsProps = {
  values: ExecutorFormValues;
  onChange: (values: ExecutorFormValues) => void;
};

export function ExecutorFormFields({ values, onChange }: ExecutorFormFieldsProps) {
  const update = (patch: Partial<ExecutorFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View>
      <TextInput
        label="Имя"
        value={values.name}
        onChangeText={(name) => update({ name })}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Телефон"
        value={values.phone}
        onChangeText={(phone) => update({ phone })}
        mode="outlined"
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={values.email}
        onChangeText={(email) => update({ email })}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Заметка"
        value={values.note}
        onChangeText={(note) => update({ note })}
        mode="outlined"
        multiline
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
});
