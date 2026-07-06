import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';

import { ScreenLayout } from '../../components/ScreenLayout';
import {
  ProjectFormFields,
  type ProjectFormValues,
} from '../../components/project/ProjectFormFields';
import { ProjectPhotoPicker } from '../../components/project/ProjectPhotoPicker';
import { createPhoto } from '../../repositories/photoRepository';
import { createProject } from '../../repositories/projectRepository';
import { getCurrentCoordinates } from '../../utils/location';
import { savePhotoFromUri } from '../../utils/photos';

const INITIAL_VALUES: ProjectFormValues = {
  name: '',
  description: '',
  finished: true,
  liked: false,
  dd: null,
};

export default function CreateProjectScreen() {
  const [values, setValues] = useState<ProjectFormValues>(INITIAL_VALUES);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestLocation = async () => {
    setLocationLoading(true);
    try {
      const coordinates = await getCurrentCoordinates();

      if (!coordinates) {
        Alert.alert(
          'Геолокация',
          'Не удалось получить координаты. Проверьте разрешения.',
        );
        return;
      }

      setValues((current) => ({ ...current, dd: coordinates }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSave = async () => {
    if (!values.name.trim()) {
      setErrorMessage('Укажите название проекта');
      return;
    }

    setSaving(true);
    try {
      const project = await createProject({
        name: values.name.trim(),
        description: values.description.trim(),
        finished: values.finished,
        liked: values.liked,
        dd: values.dd,
      });

      for (const uri of photos) {
        const filePath = await savePhotoFromUri(uri, project.id);
        await createPhoto({ projectId: project.id, filePath });
      }

      router.replace(`/project/${project.id}`);
    } catch (error) {
      console.error(error);
      setErrorMessage('Не удалось сохранить проект');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="Создать проект">
      <ProjectFormFields
        values={values}
        onChange={setValues}
        onRequestLocation={handleRequestLocation}
        locationLoading={locationLoading}
      />

      <ProjectPhotoPicker photos={photos} onChange={setPhotos} />

      <View style={styles.actions}>
        <Button mode="contained" loading={saving} onPress={handleSave}>
          Сохранить проект
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
