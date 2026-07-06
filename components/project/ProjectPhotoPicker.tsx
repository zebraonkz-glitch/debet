import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

import { pickImagesFromLibrary, takePhotoWithCamera } from '../../utils/imagePicker';

type ProjectPhotoPickerProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  title?: string;
};

export function ProjectPhotoPicker({
  photos,
  onChange,
  title = 'Фотографии',
}: ProjectPhotoPickerProps) {
  const addPhotos = async (uris: string[]) => {
    if (uris.length === 0) {
      return;
    }

    onChange([...photos, ...uris]);
  };

  const handlePickFromGallery = async () => {
    try {
      const uris = await pickImagesFromLibrary();
      await addPhotos(uris);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await takePhotoWithCamera();
      if (uri) {
        await addPhotos([uri]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>

      {photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} />
              <IconButton
                icon="close"
                size={16}
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          Фотографии не прикреплены
        </Text>
      )}

      <View style={styles.actions}>
        <Button mode="outlined" icon="image" onPress={handlePickFromGallery}>
          Галерея
        </Button>
        <Button mode="outlined" icon="camera" onPress={handleTakePhoto}>
          Камера
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
    color: '#1a1a2e',
  },
  gallery: {
    marginBottom: 8,
  },
  photoWrap: {
    marginRight: 8,
    position: 'relative',
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#e3e7ee',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    margin: 0,
  },
  empty: {
    color: '#6b7280',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});
