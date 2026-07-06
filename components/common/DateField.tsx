import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { formatDate, formatDateOnly } from '../../utils/format';

type DateFieldProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'datetime';
};

function formatValue(value: Date, mode: 'date' | 'datetime'): string {
  return mode === 'datetime'
    ? formatDate(value.toISOString())
    : formatDateOnly(value.toISOString());
}

function openAndroidPicker(
  value: Date,
  mode: 'date' | 'datetime',
  onChange: (date: Date) => void,
) {
  DateTimePickerAndroid.open({
    value,
    mode: 'date',
    onValueChange: (_event, selectedDate) => {
      if (!selectedDate) {
        return;
      }

      if (mode === 'date') {
        onChange(selectedDate);
        return;
      }

      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'time',
        is24Hour: true,
        onValueChange: (_timeEvent, selectedTime) => {
          if (selectedTime) {
            onChange(selectedTime);
          }
        },
      });
    },
  });
}

export function DateField({
  label,
  value,
  onChange,
  mode = 'date',
}: DateFieldProps) {
  const [showIosPicker, setShowIosPicker] = useState(false);

  const handlePress = () => {
    if (Platform.OS === 'android') {
      openAndroidPicker(value, mode, onChange);
      return;
    }

    setShowIosPicker((current) => !current);
  };

  return (
    <View style={styles.block}>
      <Text variant="titleMedium" style={styles.label}>
        {label}
      </Text>
      <Pressable onPress={handlePress}>
        <Text variant="bodyLarge" style={styles.value}>
          {formatValue(value, mode)}
        </Text>
      </Pressable>
      {Platform.OS === 'ios' && showIosPicker ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display="spinner"
          onValueChange={(_event, selectedDate) => {
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
          onDismiss={() => setShowIosPicker(false)}
        />
      ) : null}
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
  value: {
    color: '#1a5fb4',
  },
});
